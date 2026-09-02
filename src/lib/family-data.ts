import { createClient } from "@/lib/supabase/server";
import { localDate, slotHasStarted, SLOT_ORDER } from "@/lib/today";
import type { Enums } from "@/lib/supabase/types";
import type { DocumentSummary, LatestMeasurement } from "@/lib/health-data";

/**
 * The shapes a family member's screens read.
 *
 * The owner's Home answers "what do I need to do today". This one answers a
 * different question — "how is she doing" — so it is built from different data
 * and shaped differently. It is not the owner's screen with the buttons taken
 * away.
 *
 * WHAT IS DELIBERATELY NOT HERE: her mood. The daily check-in is a soft,
 * private signal she gives herself, and the access screen a family member
 * agreed to promises medicines, readings, documents and today's care — not how
 * she said she felt. Nothing should appear here that was not asked for there.
 */
export type MedicinesToday = {
  confirmed: number;
  /** Doses due so far today: medicines x slots that have already come around. */
  due: number;
  activeCount: number;
};

export type FamilyHome = {
  latest: Record<Enums<"measurement_type">, LatestMeasurement | null>;
  medicines: MedicinesToday;
  documents: DocumentSummary[];
};

/** How far back the feed looks. Beyond this, "recent" stops being true. */


/**
 * How today's medicines are going, as a count.
 *
 * A family member does not need the per-dose grid the owner confirms against —
 * they need "3 of 4 confirmed". Doses that have not come around yet are not
 * counted against her: at nine in the morning an evening tablet is not
 * outstanding, it simply has not happened. That is the same rule the owner's
 * own Home follows, and it is what keeps this screen from manufacturing alarm
 * out of a perfectly normal Tuesday morning.
 */

/** One medicine as it reads on the family Health page, under its time of day. */
export type MedicineAtSlot = {
  id: string;
  name: string;
  conditionTag: string | null;
  remarks: string | null;
  /** All the slots this medicine is taken at, for the three dots. */
  times: Enums<"time_of_day">[];
  /** Today, at THIS slot. "unconfirmed" is the absence of a log row. */
  status: Enums<"medication_status">;
  /** False for a slot that has not come around yet — not a missed dose. */
  started: boolean;
};

export type MedicinesBySlot = {
  slot: Enums<"time_of_day">;
  medicines: MedicineAtSlot[];
}[];

/**
 * Her medicines, grouped the way her own Home groups them: morning,
 * afternoon, evening.
 *
 * The son is answering "what does Mum take, and has she taken it" — which is
 * the same shape as her own screen, so it is grouped the same way rather than
 * given a layout of its own. A medicine taken twice a day appears under both
 * slots, because that is when she takes it and the count of rows is not the
 * point.
 *
 * Status is per medicine per slot rather than the aggregate the owner's Home
 * uses: she is confirming a whole slot at once and he is reading it, so he
 * wants to know WHICH one is outstanding, not how many.
 */
export async function getMedicinesBySlot(
  accountId: string,
  /**
   * Which day to read the logs for. Defaults to today, so every existing
   * caller is unchanged — Family View passes a date when one has been chosen.
   */
  date: string = localDate(),
): Promise<MedicinesBySlot> {
  const supabase = await createClient();

  const [meds, logs] = await Promise.all([
    supabase
      .from("medications")
      .select("id, name, condition_tag, remarks, times_of_day")
      .eq("account_id", accountId)
      .is("archived_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("medication_logs")
      .select("medication_id, slot, status")
      .eq("account_id", accountId)
      .eq("local_date", date),
  ]);

  const logged = new Map(
    (logs.data ?? []).map((l) => [`${l.medication_id}:${l.slot}`, l.status]),
  );

  // A day that has already been lived has no "not yet" about it; only today
  // has slots that have not come around.
  const isToday = date === localDate();

  return SLOT_ORDER.map((slot) => ({
    slot,
    started: !isToday || slotHasStarted(slot),
    medicines: (meds.data ?? [])
      .filter((m) => m.times_of_day.includes(slot))
      .map((m) => ({
        id: m.id,
        name: m.name,
        conditionTag: m.condition_tag,
        remarks: m.remarks,
        times: m.times_of_day,
        status:
          (logged.get(`${m.id}:${slot}`) as Enums<"medication_status">) ?? "unconfirmed",
        started: slotHasStarted(slot),
      })),
  }))
    // A slot she takes nothing at is not an empty section, it is not a section.
    .filter((group) => group.medicines.length > 0)
    .map(({ slot, medicines }) => ({ slot, medicines }));
}
