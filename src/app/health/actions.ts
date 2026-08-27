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

/** Anything larger than this is almost certainly a photo that wants resizing. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];

/**
 * Stores a document and records it.
 *
 * The object path starts with the account id because that is what the storage
 * policy checks — private.is_account_member() reads the first folder segment.
 * Change the shape of this path and every document becomes unreadable.
 *
 * The row is only written once the upload has succeeded, so a failed upload
 * cannot leave a document listed that does not exist. The reverse — an object
 * with no row — is recoverable and invisible to her.
 */
export async function addDocument(formData: FormData): Promise<string | null> {
  const file = formData.get("file");
  const title = String(formData.get("title") ?? "").trim();
  const docDate = String(formData.get("doc_date") ?? "").trim() || null;
  const docType = String(formData.get("doc_type") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!(file instanceof File) || file.size === 0) return "Please choose a file to add.";
  if (!title) return "Please give this document a name.";
  if (file.size > MAX_UPLOAD_BYTES) {
    return "That file is too large. Please choose one under 10 MB.";
  }
  if (file.type && !ALLOWED.includes(file.type)) {
    return "Please choose a photo or a PDF.";
  }

  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : null;
  const path = `${accountId}/${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;

  const { error: uploadError } = await supabase.storage
    .from("health-documents")
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (uploadError) return "We couldn't add this document. Please try again.";

  const { error } = await supabase.from("health_documents").insert({
    account_id: accountId,
    title,
    doc_date: docDate,
    doc_type: docType,
    storage_path: path,
    notes,
    source: "upload",
  });
  if (error) {
    // The row is what makes a document real, so an orphaned object is cleaned
    // up rather than left paying for storage nobody can see.
    await supabase.storage.from("health-documents").remove([path]);
    return SAVE_FAILED;
  }

  revalidatePath("/health");
  return null;
}

/**
 * A short-lived link to a stored document.
 *
 * The bucket is private, so there is no public URL — a signed one is minted
 * per view and expires. Never make this bucket public to avoid the round trip.
 */
export async function getDocumentUrl(storagePath: string): Promise<string | null> {
  const accountId = await getActiveAccountId();
  if (!accountId) return null;
  // Refuse to sign anything outside the active account's own folder, so a
  // tampered path cannot be laundered through this action.
  if (!storagePath.startsWith(`${accountId}/`)) return null;

  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("health-documents")
    .createSignedUrl(storagePath, 60 * 10);
  return data?.signedUrl ?? null;
}
