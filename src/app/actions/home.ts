"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccountId, getOwnedActiveAccountId, getViewer } from "@/lib/account";
import { localDate, slotHasStarted } from "@/lib/today";
import { getMessages } from "@/lib/i18n/server";
import type { Enums } from "@/lib/supabase/types";

/** Errors are read by her, so they come out of the dictionary too. */
const saveFailed = async () => (await getMessages()).errors.saveFailed;

/**
 * Everywhere a reading is shown.
 *
 * Home and Health both display the latest, and the detail screen it was
 * entered from shows the whole history — that last one was missing, so a hard
 * reload of the page you had just saved on could serve the render from before
 * the save.
 */
function revalidateMeasurements() {
  revalidatePath("/");
  revalidatePath("/health");
  revalidatePath("/health/measurements/[type]", "page");
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
  const accountId = await getOwnedActiveAccountId();
  if (!accountId) return await saveFailed();

  // The UI hides Confirm on a slot that has not come round yet; this makes it
  // true rather than merely displayed, so a stale page cannot record a dose
  // for tonight at breakfast.
  if (status === "confirmed" && !slotHasStarted(slot)) {
    return (await getMessages()).home.confirmLater;
  }

  const supabase = await createClient();
  const { user } = await getViewer();
  const now = new Date().toISOString();
  const rows = medicationIds.map((id) => ({
    account_id: accountId,
    medication_id: id,
    local_date: localDate(),
    slot,
    status,
    confirmed_at: status === "confirmed" ? now : null,
    // Who confirmed it. The notification for this dose excludes whoever did
    // it, so leaving this out meant she was told about her own tablets.
    created_by: user?.id ?? null,
  }));

  const { error } = await supabase
    .from("medication_logs")
    .upsert(rows, { onConflict: "medication_id,local_date,slot" });
  if (error) return await saveFailed();

  // Health shows today's status per slot on the family view, not just Home.
  revalidatePath("/");
  revalidatePath("/health");
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
  if (!accountId) return await saveFailed();

  if (!Number.isFinite(input.value) || input.value <= 0) {
    return (await getMessages()).errors.enterNumber;
  }
  if (input.type === "blood_pressure" && !Number.isFinite(input.valueSecondary ?? NaN)) {
    return (await getMessages()).errors.enterBothNumbers;
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
  if (error) return await saveFailed();

  revalidateMeasurements();
  return null;
}

export async function logWalk(
  didWalk: boolean,
  minutes: number | null,
): Promise<string | null> {
  const accountId = await getOwnedActiveAccountId();
  if (!accountId) return await saveFailed();

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
  if (error) return await saveFailed();

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
  const accountId = await getOwnedActiveAccountId();
  if (!accountId) return await saveFailed();

  if (!Number.isFinite(input.value) || input.value <= 0) {
    return (await getMessages()).errors.enterNumber;
  }
  if (input.type === "blood_pressure" && !Number.isFinite(input.valueSecondary ?? NaN)) {
    return (await getMessages()).errors.enterBothNumbers;
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
  if (error) return await saveFailed();

  revalidateMeasurements();
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
  const accountId = await getOwnedActiveAccountId();
  if (!accountId) return await saveFailed();

  const supabase = await createClient();
  const { error } = await supabase
    .from("health_measurements")
    .delete()
    .eq("id", id)
    .eq("account_id", accountId);
  if (error) return (await getMessages()).errors.removeFailed;

  revalidateMeasurements();
  return null;
}
