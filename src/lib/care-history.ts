import { createClient } from "@/lib/supabase/server";
import { localDate, slotHasStarted, SLOT_ORDER } from "@/lib/today";
import type { Enums } from "@/lib/supabase/types";

/**
 * A past day, reconstructed — not recorded.
 *
 * There is no history table and there must not be one. A dose's state has
 * always been derived: medicines x times_of_day, left-joined against that
 * day's logs, with "unconfirmed" meaning no row exists. That same rule is
 * applied here to a date that is not today, which is the whole of this file.
 * Anything that stored a daily summary would be a second source of truth, free
 * to drift from the logs it was summarising.
 *
 * The one thing history has to be careful about is WHICH medicines to hold a
 * past day against. Today's Home asks for medicines that are not archived; ask
 * that of last Tuesday and a tablet she started on Friday shows up as three
 * days of doses she never missed because they never existed. So a medicine
 * counts for a day only if it had been added by then and had not yet been
 * archived.
 */
export type DoseSummary = {
  slot: Enums<"time_of_day">;
  medicineNames: string[];
  /** "unconfirmed" is the absence of a log row, exactly as everywhere else. */
  status: Enums<"medication_status">;
};

export type CareDay = {
  /** YYYY-MM-DD in Asia/Kolkata. */
  date: string;
  doses: DoseSummary[];
  /** Readings recorded that day, already formatted for display. */
  readings: { type: Enums<"measurement_type">; value: string; unit: string }[];
  walk: { didWalk: boolean; minutes: number | null } | null;
  documents: string[];
};

/**
 * Every day of one month that has already happened.
 *
 * A month at a time rather than a day at a time: the sheet is a calendar, and
 * a round trip on every date she taps would make the thing feel broken. Four
 * bounded queries, then the assembly is arithmetic.
 *
 * Days in the future are not returned at all — there is nothing to say about
 * them, and an empty day and an unlived day should never look alike.
 */
export async function getCareMonth(
  accountId: string,
  year: number,
  month: number, // 1-12
): Promise<CareDay[]> {
  const supabase = await createClient();

  const pad = (n: number) => String(n).padStart(2, "0");
  const first = `${year}-${pad(month)}-01`;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = `${year}-${pad(month)}-${pad(daysInMonth)}`;
  const today = localDate();

  const [meds, logs, measurements, walks, docs] = await Promise.all([
    // Every medicine that could have been due in this month, archived or not.
    supabase
      .from("medications")
      .select("id, name, times_of_day, created_at, archived_at")
      .eq("account_id", accountId)
      .lte("created_at", `${last}T23:59:59+05:30`),
    supabase
      .from("medication_logs")
      .select("medication_id, local_date, slot, status")
      .eq("account_id", accountId)
      .gte("local_date", first)
      .lte("local_date", last),
    supabase
      .from("health_measurements")
      .select("type, value, value_secondary, unit, measured_at")
      .eq("account_id", accountId)
      .gte("measured_at", `${first}T00:00:00+05:30`)
      .lte("measured_at", `${last}T23:59:59+05:30`)
      .order("measured_at", { ascending: false }),
    supabase
      .from("walk_checkins")
      .select("local_date, did_walk, duration_minutes")
      .eq("account_id", accountId)
      .gte("local_date", first)
      .lte("local_date", last),
    supabase
      .from("health_documents")
      .select("title, created_at")
      .eq("account_id", accountId)
      .gte("created_at", `${first}T00:00:00+05:30`)
      .lte("created_at", `${last}T23:59:59+05:30`),
  ]);

  /**
   * The day a timestamp belongs to, in HER timezone.
   *
   * Never the first ten characters of the ISO string: Postgres returns these
   * in UTC, and IST is UTC+5:30, so anything she recorded between midnight and
   * half past five in the morning would be filed under the previous day. The
   * dose logs do not need this — local_date is already a date in her timezone,
   * which is exactly why that column exists.
   */
  const dayOf = (iso: string) => localDate(new Date(iso));

  const logged = new Map(
    (logs.data ?? []).map((l) => [`${l.local_date}:${l.medication_id}:${l.slot}`, l.status]),
  );

  /**
   * Which medicines were actually answered on a given day.
   *
   * The archive window alone is not enough. A medicine archived on Tuesday
   * evening was still taken on Tuesday morning, and holding it to
   * "archived_at is after this day" dropped it out of that day entirely —
   * taking her confirmation with it. A dose she answered must never disappear
   * from history because of something she did to the medicine afterwards.
   */
  const answeredOn = new Map<string, Set<string>>();
  for (const l of logs.data ?? []) {
    const set = answeredOn.get(l.local_date) ?? new Set<string>();
    set.add(l.medication_id);
    answeredOn.set(l.local_date, set);
  }

  const days: CareDay[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${pad(month)}-${pad(d)}`;
    if (date > today) break; // Not yet lived.

    // Which medicines this day is entitled to hold her to.
    const active = (meds.data ?? []).filter((m) => {
      if (dayOf(m.created_at) > date) return false;
      const stillOn = !m.archived_at || dayOf(m.archived_at) > date;
      // Archived that day or since, but she answered it — so it belongs to the
      // day regardless of what happened to it afterwards.
      return stillOn || (answeredOn.get(date)?.has(m.id) ?? false);
    });

    const doses: DoseSummary[] = [];
    for (const slot of SLOT_ORDER) {
      const inSlot = active.filter((m) => m.times_of_day.includes(slot));
      if (inSlot.length === 0) continue;
      // Today only: a slot that has not come around yet is not outstanding.
      // The same rule the owner's Home and the family count already follow.
      if (date === today && !slotHasStarted(slot)) continue;

      const statuses = inSlot.map(
        (m) => logged.get(`${date}:${m.id}:${slot}`) ?? "unconfirmed",
      );
      doses.push({
        slot,
        medicineNames: inSlot.map((m) => m.name),
        status: statuses.every((s) => s === "confirmed")
          ? "confirmed"
          : statuses.every((s) => s === "skipped")
            ? "skipped"
            : "unconfirmed",
      });
    }

    const walkRow = (walks.data ?? []).find((w) => w.local_date === date);

    days.push({
      date,
      doses,
      readings: (measurements.data ?? [])
        .filter((m) => dayOf(m.measured_at) === date)
        .map((m) => ({
          type: m.type,
          value:
            m.type === "blood_pressure" && m.value_secondary != null
              ? `${Number(m.value)}/${Number(m.value_secondary)}`
              : String(Number(m.value)),
          unit: m.unit,
        })),
      walk: walkRow
        ? { didWalk: walkRow.did_walk, minutes: walkRow.duration_minutes }
        : null,
      documents: (docs.data ?? [])
        .filter((x) => dayOf(x.created_at) === date)
        .map((x) => x.title),
    });
  }

  return days;
}

/**
 * One day, for Home in historical mode.
 *
 * Deliberately routed through getCareMonth rather than given its own queries.
 * The reconstruction rules — which medicines a day may be held to, how a slot
 * aggregates, which timezone a timestamp belongs to — are subtle enough that a
 * second implementation would drift from this one within a month. It costs a
 * month-scoped read to render a day, which is five bounded queries, and buys
 * exactly one source of truth for what a past day was.
 */
export async function getCareDay(
  accountId: string,
  date: string,
): Promise<CareDay | null> {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  if (!year || !month) return null;
  const days = await getCareMonth(accountId, year, month);
  return days.find((d) => d.date === date) ?? null;
}
