"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccountId } from "@/lib/account";
import type { Enums } from "@/lib/supabase/types";

const SAVE_FAILED = "We couldn't save this. Please try again.";

export type MedicineInput = {
  name: string;
  timesOfDay: Enums<"time_of_day">[];
  conditionTag: string | null;
  remarks: string | null;
};

/**
 * Validation shared by add and edit.
 *
 * Only two things are actually required: what it is called, and when she takes
 * it. Condition and remarks never block saving — that rule runs from the IA
 * through onboarding and holds here too.
 */
function check(input: MedicineInput): string | null {
  if (!input.name.trim()) return "Please enter the medicine name.";
  if (input.timesOfDay.length === 0) return "Please choose when you take it.";
  return null;
}

function clean(input: MedicineInput) {
  return {
    name: input.name.trim(),
    times_of_day: input.timesOfDay,
    condition_tag: input.conditionTag?.trim() || null,
    remarks: input.remarks?.trim() || null,
  };
}

export async function createMedicine(input: MedicineInput): Promise<string | null> {
  const invalid = check(input);
  if (invalid) return invalid;

  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  const { error } = await supabase
    .from("medications")
    .insert({ account_id: accountId, ...clean(input) });
  if (error) return SAVE_FAILED;

  revalidatePath("/health/medicines");
  revalidatePath("/health");
  revalidatePath("/");
  return null;
}

export async function updateMedicine(
  id: string,
  input: MedicineInput,
): Promise<string | null> {
  const invalid = check(input);
  if (invalid) return invalid;

  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  // Scoped to the account as well as the id. RLS would refuse a row on another
  // account anyway, but saying so here means a wrong id fails as a no-op
  // rather than depending on the policy to catch it.
  const { error } = await supabase
    .from("medications")
    .update(clean(input))
    .eq("id", id)
    .eq("account_id", accountId);
  if (error) return SAVE_FAILED;

  revalidatePath("/health/medicines");
  revalidatePath("/health");
  revalidatePath("/");
  return null;
}
