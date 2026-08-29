import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { deepLink, render, type Lang } from "./copy.ts";

/**
 * Drains the notification outbox and sends the pushes.
 *
 * Called on a schedule by pg_cron. Everything about it is designed so that
 * failing is safe: the health data is already committed before a row appears
 * here, a row is claimed before it is sent, and a send that never lands leaves
 * the app showing exactly the right thing anyway.
 *
 * Runs with the service role, so RLS does not apply — which is precisely why
 * recipient resolution below is written out explicitly rather than leaned on.
 */
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:hello@sakha.app";
/** Shared secret so only pg_cron (and a developer) can trigger a drain. */
const DISPATCH_SECRET = Deno.env.get("DISPATCH_SECRET")!;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

/** A batch is small on purpose: this runs every minute and never needs to rush. */
const BATCH = 50;

Deno.serve(async (req) => {
  if (req.headers.get("x-dispatch-secret") !== DISPATCH_SECRET) {
    return new Response("forbidden", { status: 403 });
  }

  // 1. Let the scheduler queue anything newly due, in the same pass.
  await db.rpc("run_medicine_reminders");

  // 2. Claim a batch. sent_at is stamped BEFORE sending: at-most-once is the
  //    right bias here. A reminder that silently fails is a missed buzz; a
  //    reminder sent twice because we retried is the phone crying wolf, and
  //    she is the one who has to trust it.
  const { data: rows, error } = await db
    .from("notification_outbox")
    .select("*")
    .is("sent_at", null)
    .order("created_at", { ascending: true })
    .limit(BATCH);

  if (error) return json({ error: error.message }, 500);
  if (!rows?.length) return json({ sent: 0, rows: 0 });

  let sent = 0;
  let skipped = 0;
  // A Set: one dead device across five events is one dead device.
  const stale = new Set<string>();

  for (const row of rows) {
    await db
      .from("notification_outbox")
      .update({ sent_at: new Date().toISOString(), attempts: row.attempts + 1 })
      .eq("id", row.id);

    /**
     * WHO gets this — resolved now, from the membership table, never from
     * anything stored on the event.
     *
     * This is the whole security story. Access revoked between the action and
     * this moment means no membership row, which means no subscription, which
     * means no push. A queued notification for somebody who has been removed
     * simply finds nobody to send to.
     */
    const isReminder = row.kind === "medicine_reminder";
    const { data: members } = await db
      .from("account_members")
      .select("user_id, role")
      .eq("account_id", row.account_id);

    const recipients = (members ?? [])
      // A reminder is for the person whose medicine it is. Everything else is
      // news for the others — never an echo back to whoever just did it.
      .filter((m) => (isReminder ? m.role === "owner" : m.user_id !== row.actor_id))
      .map((m) => m.user_id);

    if (!recipients.length) {
      skipped++;
      continue;
    }

    /**
     * Every device belonging to a recipient — and none belonging to the actor.
     *
     * NOT filtered by account_id. A subscription records which account
     * happened to be open when the device registered, which says nothing about
     * who the device belongs to: a son who turned notifications on while
     * looking at his own Sakha would never have been reached about his
     * mother's, because his row carries his account id and hers is the one
     * being notified about.
     *
     * The actor exclusion is stated again here rather than left implicit in
     * `recipients`. It is the guarantee that matters most on this screen — she
     * must never be told about her own tablets — and it should not depend on
     * how the list above happened to be built.
     */
    let subQuery = db
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth, language")
      .in("user_id", recipients);
    if (row.actor_id) subQuery = subQuery.neq("user_id", row.actor_id);
    const { data: subs } = await subQuery;

    if (!subs?.length) {
      skipped++;
      continue;
    }

    // The actor's name, for "Asha recorded…". The account's display name when
    // the owner acted, their own profile name otherwise.
    let actorName: string | null = null;
    if (!isReminder && row.actor_id) {
      const [{ data: account }, { data: profile }] = await Promise.all([
        db.from("accounts").select("display_name").eq("id", row.account_id).maybeSingle(),
        db.from("profiles").select("full_name").eq("id", row.actor_id).maybeSingle(),
      ]);
      const { data: actorMembership } = await db
        .from("account_members")
        .select("role")
        .eq("account_id", row.account_id)
        .eq("user_id", row.actor_id)
        .maybeSingle();
      actorName =
        actorMembership?.role === "owner"
          ? (account?.display_name ?? null)
          : (profile?.full_name ?? account?.display_name ?? null);
    }

    for (const sub of subs) {
      const lang: Lang = sub.language === "hi" ? "hi" : "en";
      const { title, body } = render({
        kind: row.kind,
        lang,
        actorName,
        slot: row.slot,
        measurementType: row.measurement_type,
        bodyValue: row.body_value,
        medicineNames: row.medicine_names,
      });

      const payload = JSON.stringify({
        title,
        body,
        url: deepLink(row.account_id, row.kind, row.measurement_type),
        // Collapses an older unopened notification of the same kind rather
        // than stacking three of them on her lock screen.
        tag: `${row.kind}:${row.account_id}`,
      });

      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        // 404/410 is the push service saying this endpoint is gone for good.
        // Anything else may be transient and the subscription is left alone.
        if (status === 404 || status === 410) stale.add(sub.id);
        else {
          await db
            .from("notification_outbox")
            .update({ last_error: String((e as Error).message ?? e).slice(0, 300) })
            .eq("id", row.id);
        }
      }
    }
  }

  if (stale.size) {
    await db.from("push_subscriptions").delete().in("id", [...stale]);
  }

  return json({ rows: rows.length, sent, skipped, staleRemoved: stale.size });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
