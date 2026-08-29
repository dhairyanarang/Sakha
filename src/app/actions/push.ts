"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveAccountId, getViewer } from "@/lib/account";
import { getMessages } from "@/lib/i18n/server";
import { isLocale } from "@/lib/i18n";

/**
 * Stores the device's push subscription.
 *
 * The account is taken from the session, never from the caller: a client that
 * sent its own account_id could otherwise register a device against somebody
 * else's account and start receiving their health notifications. The RLS
 * policy on push_subscriptions checks the same thing again underneath.
 *
 * Upserts on the endpoint, which is unique per device per browser. So the same
 * phone re-enabling notifications updates one row rather than accumulating
 * them, and a phone that is signed in as a different person gets its row
 * re-pointed rather than duplicated.
 */
export async function savePushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  language: string;
}): Promise<string | null> {
  const { user } = await getViewer();
  if (!user) return (await getMessages()).errors.saveFailed;

  const accountId = await getActiveAccountId();
  if (!accountId) return (await getMessages()).errors.saveFailed;

  if (!input.endpoint || !input.p256dh || !input.auth) {
    return (await getMessages()).errors.saveFailed;
  }

  const supabase = await createClient();
  // Through the RPC rather than a plain upsert: an endpoint belongs to the
  // browser, so a device previously registered by somebody else has to change
  // hands rather than collide. See the 20260829020000 migration.
  const { error } = await supabase.rpc("register_push_subscription", {
    p_endpoint: input.endpoint,
    p_p256dh: input.p256dh,
    p_auth: input.auth,
    // The device's language, not the account's — a son reading English may be
    // watching a mother whose Sakha is in Hindi.
    p_language: isLocale(input.language) ? input.language : "en",
    p_account_id: accountId,
  });
  if (error) return (await getMessages()).errors.saveFailed;

  return null;
}
