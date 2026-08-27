"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccountId } from "@/lib/account";

const SAVE_FAILED = "We couldn't save this. Please try again.";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function updateDisplayName(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return "Please enter your name.";

  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ display_name: trimmed })
    .eq("id", accountId);
  if (error) return SAVE_FAILED;

  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath("/health");
  return null;
}

export async function updateLanguage(language: string): Promise<string | null> {
  if (language !== "en" && language !== "hi") return SAVE_FAILED;

  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ language })
    .eq("id", accountId);
  if (error) return SAVE_FAILED;

  revalidatePath("/profile");
  return null;
}

/**
 * Replaces her profile photo.
 *
 * The path starts with the account id because that is what the storage policy
 * checks, and the filename is fixed so a new photo overwrites the old one
 * rather than leaving every previous picture behind — hence upsert, which is
 * why the bucket needs UPDATE as well as INSERT.
 *
 * Google's picture is only ever a fallback; once this succeeds, hers wins.
 */
export async function uploadAvatar(formData: FormData): Promise<string | null> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return "Please choose a photo.";
  if (file.size > MAX_AVATAR_BYTES) return "That photo is too large. Please choose one under 5 MB.";
  if (file.type && !ALLOWED.includes(file.type)) return "Please choose a photo.";

  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${accountId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type || undefined, upsert: true });
  if (uploadError) return "We couldn't save this photo. Please try again.";

  const { error } = await supabase
    .from("accounts")
    .update({ avatar_path: path })
    .eq("id", accountId);
  if (error) return SAVE_FAILED;

  revalidatePath("/profile");
  revalidatePath("/profile/me");
  revalidatePath("/");
  revalidatePath("/health");
  return null;
}

/** Drops back to the Google picture. */
export async function removeAvatar(): Promise<string | null> {
  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  const { data: account } = await supabase
    .from("accounts")
    .select("avatar_path")
    .eq("id", accountId)
    .maybeSingle();

  const { error } = await supabase
    .from("accounts")
    .update({ avatar_path: null })
    .eq("id", accountId);
  if (error) return SAVE_FAILED;

  if (account?.avatar_path) {
    await supabase.storage.from("avatars").remove([account.avatar_path]);
  }

  revalidatePath("/profile");
  revalidatePath("/profile/me");
  revalidatePath("/");
  revalidatePath("/health");
  return null;
}
