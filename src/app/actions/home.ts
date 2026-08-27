"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccountId } from "@/lib/account";
import { localDate, slotHasStarted } from "@/lib/today";
import type { Enums } from "@/lib/supabase/types";

const SAVE_FAILED = "We couldn't save this. Please try again.";

export async function setMood(mood: Enums<"mood_level">): Promise<string | null> {
  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  // One check-in per day; changing her mind updates rather than stacking rows.
  const { error } = await supabase
    .from("daily_checkins")
    .upsert(
      { account_id: accountId, local_date: localDate(), mood },
      { onConflict: "account_id,local_date" },
    );
  if (error) return SAVE_FAILED;

  revalidatePath("/");
  return null;
}

/**
 * Confirms every medicine in a slot at once, which is what the single Confirm
 * button on the card means.
 *
 * Confirmation is allowed at any time — there is no lateness check anywhere in
 * this path, and no state other than confirmed, skipped or unconfirmed.
 */
export async function confirmDoses(
  medicationIds: string[],
  slot: Enums<"time_of_day">,
  status: Enums<"medication_status"> = "confirmed",
): Promise<string | null> {
  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  // The UI hides Confirm on a slot that has not come round yet; this makes it
  // true rather than merely displayed, so a stale page cannot record a dose
  // for tonight at breakfast.
  if (status === "confirmed" && !slotHasStarted(slot)) {
    return "You can confirm this later today.";
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const rows = medicationIds.map((id) => ({
    account_id: accountId,
    medication_id: id,
    local_date: localDate(),
    slot,
    status,
    confirmed_at: status === "confirmed" ? now : null,
  }));

  const { error } = await supabase
    .from("medication_logs")
    .upsert(rows, { onConflict: "medication_id,local_date,slot" });
  if (error) return SAVE_FAILED;

  revalidatePath("/");
  return null;
}

export async function recordMeasurement(input: {
  type: Enums<"measurement_type">;
  value: number;
  valueSecondary?: number | null;
  unit: string;
  measuredAt: string;
}): Promise<string | null> {
  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  if (!Number.isFinite(input.value) || input.value <= 0) {
    return "Please enter a number.";
  }
  if (input.type === "blood_pressure" && !Number.isFinite(input.valueSecondary ?? NaN)) {
    return "Please enter both numbers.";
  }

  const supabase = await createClient();
  const { error } = await supabase.from("health_measurements").insert({
    account_id: accountId,
    type: input.type,
    value: input.value,
    value_secondary: input.type === "blood_pressure" ? input.valueSecondary : null,
    unit: input.unit,
    measured_at: input.measuredAt,
  });
  if (error) return SAVE_FAILED;

  revalidatePath("/");
  return null;
}

export async function logWalk(
  didWalk: boolean,
  minutes: number | null,
): Promise<string | null> {
  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  const { error } = await supabase.from("walk_checkins").upsert(
    {
      account_id: accountId,
      local_date: localDate(),
      did_walk: didWalk,
      duration_minutes: didWalk ? minutes : null,
    },
    { onConflict: "account_id,local_date" },
  );
  if (error) return SAVE_FAILED;

  revalidatePath("/");
  return null;
}

/**
 * Corrects a reading she already took.
 *
 * Same validation as recording a new one — a corrected reading is not a
 * lesser one, and must not be allowed to become nonsense.
 */
export async function updateMeasurement(
  id: string,
  input: {
    type: Enums<"measurement_type">;
    value: number;
    valueSecondary?: number | null;
    unit: string;
    measuredAt: string;
  },
): Promise<string | null> {
  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  if (!Number.isFinite(input.value) || input.value <= 0) {
    return "Please enter a number.";
  }
  if (input.type === "blood_pressure" && !Number.isFinite(input.valueSecondary ?? NaN)) {
    return "Please enter both numbers.";
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("health_measurements")
    .update({
      value: input.value,
      value_secondary: input.type === "blood_pressure" ? input.valueSecondary : null,
      unit: input.unit,
      measured_at: input.measuredAt,
    })
    .eq("id", id)
    .eq("account_id", accountId);
  if (error) return SAVE_FAILED;

  revalidatePath("/health");
  revalidatePath("/");
  return null;
}

/**
 * Removes a reading.
 *
 * A real delete, unlike a medicine: nothing else in the schema points at a
 * measurement, so there is no history to strand by removing it. A wrong number
 * she never took is worth being able to get rid of properly.
 */
export async function deleteMeasurement(id: string): Promise<string | null> {
  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  const { error } = await supabase
    .from("health_measurements")
    .delete()
    .eq("id", id)
    .eq("account_id", accountId);
  if (error) return "We couldn't remove this. Please try again.";

  revalidatePath("/health");
  revalidatePath("/");
  return null;
}
