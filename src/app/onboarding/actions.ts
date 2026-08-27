"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccountId, getOwnedAccount, setActiveAccount } from "@/lib/account";
import type { Enums } from "@/lib/supabase/types";

/**
 * Errors are calm and actionable, never blaming and never technical.
 * "We couldn't save this, please try again" — not a stack trace.
 */
const SAVE_FAILED = "We couldn't save this. Please try again.";

/**
 * The account is created as soon as we have a name, not at the end of
 * onboarding. If she stops halfway she still has a usable account, rather than
 * a half-filled form that evaporates.
 *
 * Idempotent by design. Submitting this screen twice — which happens the
 * moment someone goes back a step and presses Next again — used to create a
 * SECOND account, silently splitting their contacts and medicines across two.
 * If they already own one, we rename it instead.
 */
export async function saveName(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return "Please enter your name.";

  const supabase = await createClient();
  const owned = await getOwnedAccount();

  if (owned) {
    const { error } = await supabase
      .from("accounts")
      .update({ display_name: name })
      .eq("id", owned.accountId);
    if (error) return SAVE_FAILED;
    await setActiveAccount(owned.accountId);
  } else {
    const { data, error } = await supabase.rpc("create_account", { p_display_name: name });
    if (error || !data) return SAVE_FAILED;
    await setActiveAccount(data);
  }

  redirect("/onboarding/language");
}

export async function saveLanguage(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const language = String(formData.get("language") ?? "en");
  const accountId = await getActiveAccountId();
  if (!accountId) redirect("/onboarding/name");

  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ language })
    .eq("id", accountId);
  if (error) return SAVE_FAILED;

  redirect("/onboarding/family");
}

export async function saveContact(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const relation = String(formData.get("relation") ?? "").trim() || null;
  const andAnother = formData.get("intent") === "another";

  if (!name || !phone) return "Please add both a name and a phone number.";

  const accountId = await getActiveAccountId();
  if (!accountId) redirect("/onboarding/name");

  const supabase = await createClient();
  const { error } = await supabase
    .from("trusted_contacts")
    .insert({ account_id: accountId, name, phone, relation });
  if (error) return SAVE_FAILED;

  revalidatePath("/onboarding/family");
  redirect(andAnother ? "/onboarding/family?added=1" : "/onboarding/medicine");
}

export async function saveMedicine(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = String(formData.get("name") ?? "").trim();
  const times = formData.getAll("times_of_day").map(String) as Enums<"time_of_day">[];
  const conditionTag = String(formData.get("condition_tag") ?? "").trim() || null;
  const remarks = String(formData.get("remarks") ?? "").trim() || null;
  const andAnother = formData.get("intent") === "another";

  if (!name) return "Please enter the medicine name.";
  // Multi-select: one medicine can be Morning AND Evening on a single entry.
  if (times.length === 0) return "Please choose when you take it.";

  const accountId = await getActiveAccountId();
  if (!accountId) redirect("/onboarding/name");

  const supabase = await createClient();
  const { error } = await supabase.from("medications").insert({
    account_id: accountId,
    name,
    times_of_day: times,
    condition_tag: conditionTag,
    remarks,
  });
  if (error) return SAVE_FAILED;

  revalidatePath("/onboarding/medicine");
  redirect(andAnother ? "/onboarding/medicine?added=1" : "/onboarding/reminders");
}
