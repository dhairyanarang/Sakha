import { createClient } from "@/lib/supabase/server";
import { localDate, SLOT_ORDER } from "@/lib/today";
import type { Enums } from "@/lib/supabase/types";

export type DoseGroup = {
  slot: Enums<"time_of_day">;
  medicineNames: string[];
  medicationIds: string[];
  status: Enums<"medication_status">; // "unconfirmed" means no row exists yet
};

export type HomeData = {
  today: string;
  mood: Enums<"mood_level"> | null;
  doses: DoseGroup[];
  lastSugar: { value: number; unit: string } | null;
  lastBp: { systolic: number; diastolic: number; unit: string } | null;
  walk: { didWalk: boolean; minutes: number | null } | null;
};

/**
 * Everything Home renders, in one pass.
 *
 * "Unconfirmed" is the absence of a log row, so today's doses are derived from
 * medications x times_of_day and left-joined against today's logs rather than
 * being materialised in advance. That keeps the screen correct whether or not
 * a reminder was ever delivered.
 */
export async function getHomeData(accountId: string): Promise<HomeData> {
  const supabase = await createClient();
  const today = localDate();

  const [meds, logs, checkin, sugar, bp, walk] = await Promise.all([
    supabase
      .from("medications")
      .select("id, name, times_of_day")
      .eq("account_id", accountId)
      .is("archived_at", null)
      .order("created_at"),
    supabase
      .from("medication_logs")
      .select("medication_id, slot, status")
      .eq("account_id", accountId)
      .eq("local_date", today),
    supabase
      .from("daily_checkins")
      .select("mood")
      .eq("account_id", accountId)
      .eq("local_date", today)
      .maybeSingle(),
    supabase
      .from("health_measurements")
      .select("value, unit")
      .eq("account_id", accountId)
      .eq("type", "blood_sugar")
      .order("measured_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("health_measurements")
      .select("value, value_secondary, unit")
      .eq("account_id", accountId)
      .eq("type", "blood_pressure")
      .order("measured_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("walk_checkins")
      .select("did_walk, duration_minutes")
      .eq("account_id", accountId)
      .eq("local_date", today)
      .maybeSingle(),
  ]);

  const logged = new Map(
    (logs.data ?? []).map((l) => [`${l.medication_id}:${l.slot}`, l.status]),
  );

  const doses: DoseGroup[] = [];
  for (const slot of SLOT_ORDER) {
    const inSlot = (meds.data ?? []).filter((m) => m.times_of_day.includes(slot));
    if (inSlot.length === 0) continue;

    const statuses = inSlot.map((m) => logged.get(`${m.id}:${slot}`) ?? "unconfirmed");
    // A slot only counts as settled once every medicine in it is answered.
    const status: Enums<"medication_status"> = statuses.every((s) => s === "confirmed")
      ? "confirmed"
      : statuses.every((s) => s === "skipped")
        ? "skipped"
        : "unconfirmed";

    doses.push({
      slot,
      medicineNames: inSlot.map((m) => m.name),
      medicationIds: inSlot.map((m) => m.id),
      status,
    });
  }

  return {
    today,
    mood: checkin.data?.mood ?? null,
    doses,
    lastSugar: sugar.data ? { value: Number(sugar.data.value), unit: sugar.data.unit } : null,
    lastBp:
      bp.data && bp.data.value_secondary != null
        ? {
            systolic: Number(bp.data.value),
            diastolic: Number(bp.data.value_secondary),
            unit: bp.data.unit,
          }
        : null,
    walk: walk.data
      ? { didWalk: walk.data.did_walk, minutes: walk.data.duration_minutes }
      : null,
  };
}
