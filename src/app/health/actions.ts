"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccountId, getOwnedActiveAccountId } from "@/lib/account";
import { getMessages } from "@/lib/i18n/server";
import type { Enums } from "@/lib/supabase/types";

const saveFailed = async () => (await getMessages()).errors.saveFailed;

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
async function check(input: MedicineInput): Promise<string | null> {
  const t = await getMessages();
  if (!input.name.trim()) return t.errors.enterMedicineName;
  if (input.timesOfDay.length === 0) return t.errors.chooseWhen;
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
  const invalid = await check(input);
  if (invalid) return invalid;

  const accountId = await getOwnedActiveAccountId();
  if (!accountId) return await saveFailed();

  const supabase = await createClient();
  const { error } = await supabase
    .from("medications")
    .insert({ account_id: accountId, ...clean(input) });
  if (error) return await saveFailed();

  revalidatePath("/health/medicines");
  revalidatePath("/health");
  revalidatePath("/");
  return null;
}

export async function updateMedicine(
  id: string,
  input: MedicineInput,
): Promise<string | null> {
  const invalid = await check(input);
  if (invalid) return invalid;

  const accountId = await getOwnedActiveAccountId();
  if (!accountId) return await saveFailed();

  const supabase = await createClient();
  // Scoped to the account as well as the id. RLS would refuse a row on another
  // account anyway, but saying so here means a wrong id fails as a no-op
  // rather than depending on the policy to catch it.
  const { error } = await supabase
    .from("medications")
    .update(clean(input))
    .eq("id", id)
    .eq("account_id", accountId);
  if (error) return await saveFailed();

  revalidatePath("/health/medicines");
  revalidatePath("/health");
  revalidatePath("/");
  return null;
}

/**
 * Removes a medicine from her list.
 *
 * Archives rather than deletes. medication_logs reference the medicine, so a
 * hard delete would cascade and destroy the record of every dose she ever
 * confirmed — losing history she never asked to lose in order to tidy a list.
 * Setting archived_at drops it out of every query (they all filter on it) while
 * leaving the past intact, which is what the column exists for.
 */
export async function archiveMedicine(id: string): Promise<string | null> {
  const accountId = await getOwnedActiveAccountId();
  if (!accountId) return await saveFailed();

  const supabase = await createClient();
  const { error } = await supabase
    .from("medications")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id)
    .eq("account_id", accountId);
  if (error) return (await getMessages()).errors.removeFailed;

  revalidatePath("/health/medicines");
  revalidatePath("/health");
  revalidatePath("/");
  return null;
}

/**
 * Records a document the browser has already uploaded.
 *
 * The file itself never passes through here: a Server Action request is capped
 * at 1MB, so any real scan or photo threw before our own size check ran, which
 * is what surfaced as a bare server error with a digest. lib/upload.ts puts the
 * bytes in Storage directly, where the same RLS still gates who may write.
 *
 * The path is checked against the session rather than trusted, so a caller
 * cannot attach a file sitting in someone else's folder to their own document.
 * The row is written last, and a failure removes the object it would have
 * pointed at.
 */
export async function addDocument(input: {
  storagePath: string;
  title: string;
  docDate: string | null;
  docType: string | null;
  notes: string | null;
}): Promise<string | null> {
  const title = input.title.trim();
  if (!title) return (await getMessages()).errors.nameDocument;

  const accountId = await getActiveAccountId();
  if (!accountId) return await saveFailed();
  if (!input.storagePath.startsWith(`${accountId}/`)) return await saveFailed();

  const supabase = await createClient();
  const { error } = await supabase.from("health_documents").insert({
    account_id: accountId,
    title,
    doc_date: input.docDate || null,
    doc_type: input.docType || null,
    storage_path: input.storagePath,
    notes: input.notes || null,
    source: "upload",
  });
  if (error) {
    // The row is what makes a document real, so an orphaned object is cleaned
    // up rather than left paying for storage nobody can see.
    await supabase.storage.from("health-documents").remove([input.storagePath]);
    return await saveFailed();
  }

  // Home lists recent documents on the family view.
  revalidatePath("/health");
  revalidatePath("/");
  return null;
}


/**
 * Removes a document, file and all.
 *
 * The row goes first: it is what makes the document visible to her, so if the
 * object delete fails afterwards she still sees it gone rather than a listing
 * pointing at nothing. A stranded object costs storage and is invisible;
 * a stranded row is a broken screen.
 */
export async function deleteDocument(id: string): Promise<string | null> {
  const accountId = await getOwnedActiveAccountId();
  if (!accountId) return await saveFailed();

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("health_documents")
    .select("storage_path")
    .eq("id", id)
    .eq("account_id", accountId)
    .maybeSingle();
  if (!doc) return (await getMessages()).errors.removeFailed;

  const { error } = await supabase
    .from("health_documents")
    .delete()
    .eq("id", id)
    .eq("account_id", accountId);
  if (error) return (await getMessages()).errors.removeFailed;

  await supabase.storage.from("health-documents").remove([doc.storage_path]);

  // Home lists recent documents on the family view.
  revalidatePath("/health");
  revalidatePath("/");
  return null;
}
