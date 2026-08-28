"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccountId } from "@/lib/account";

const SAVE_FAILED = "We couldn't save this. Please try again.";

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
 * Records a photo the browser has already uploaded.
 *
 * The bytes never come through here. A Server Action request is capped at 1MB,
 * so sending a phone photo this way threw before any of our own checks ran —
 * see lib/upload.ts. What arrives now is just the path.
 *
 * The path is re-derived from the session rather than trusted: a caller cannot
 * point this at another account's folder by sending a different string.
 */
export async function setAvatarPath(path: string): Promise<string | null> {
  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;
  if (!path.startsWith(`${accountId}/`)) return SAVE_FAILED;

  const supabase = await createClient();
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

/**
 * Creates an invitation and returns the link to share.
 *
 * The raw token exists only in the returned URL. What is stored is its SHA-256
 * hash, so the database never holds anything that could be pasted into a
 * browser — losing the table does not hand anyone access to an account.
 */
export async function createInvitation(input: {
  name: string;
  relation: string;
}): Promise<{ url: string } | { error: string }> {
  const name = input.name.trim();
  const relation = input.relation.trim();
  if (!name) return { error: "Please enter their name." };
  if (!relation) return { error: "Please choose how they are related to you." };

  const accountId = await getActiveAccountId();
  if (!accountId) return { error: SAVE_FAILED };

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const supabase = await createClient();
  const { error } = await supabase.from("family_invitations").insert({
    account_id: accountId,
    name,
    relation,
    token_hash: tokenHash,
  });
  if (error) return { error: SAVE_FAILED };

  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  revalidatePath("/profile");
  return { url: `${protocol}://${host}/invite/${token}` };
}

/** Withdraws an invitation that has not been accepted. */
export async function cancelInvitation(id: string): Promise<string | null> {
  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  const { error } = await supabase
    .from("family_invitations")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("account_id", accountId)
    .eq("status", "pending");
  if (error) return SAVE_FAILED;

  revalidatePath("/profile");
  return null;
}

/**
 * Ends someone's access.
 *
 * Removing the membership is what actually revokes it — every policy on this
 * account reads through account_members, so the row is the access.
 */
export async function revokeAccess(userId: string): Promise<string | null> {
  const accountId = await getActiveAccountId();
  if (!accountId) return SAVE_FAILED;

  const supabase = await createClient();
  const { error } = await supabase
    .from("account_members")
    .delete()
    .eq("account_id", accountId)
    .eq("user_id", userId)
    .eq("role", "family");
  if (error) return "We couldn't remove this. Please try again.";

  revalidatePath("/profile");
  return null;
}
