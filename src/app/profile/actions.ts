"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getMemberships, getOwnedAccount, setActiveAccount } from "@/lib/account";
import { setLocaleCookie } from "@/lib/i18n/set-locale";
import { getMessages } from "@/lib/i18n/server";
import { redirect } from "next/navigation";

const saveFailed = async () => (await getMessages()).errors.saveFailed;

/**
 * Open a different account.
 *
 * Somebody can own their own account AND hold a view of a parent's; this is
 * how they move between the two. Without it, accepting an invitation pinned
 * them to that account for good — the cookie was set on acceptance and there
 * was nothing anywhere that could set it back.
 *
 * The id is re-checked against their own memberships rather than trusted.
 * A forged one would be caught by RLS regardless — every query behind it is
 * gated on is_account_member — but failing here means they get their own
 * account rather than a screen full of empty queries.
 *
 * Their LANGUAGE is deliberately left alone. It lives in their cookie and is
 * theirs; a son who reads English does not start reading Hindi because his
 * mother's account does.
 */
export async function switchAccount(accountId: string): Promise<string | null> {
  const memberships = await getMemberships();
  if (!memberships.some((m) => m.accountId === accountId)) return await saveFailed();

  await setActiveAccount(accountId);
  // Every screen is rendered against the old account right now, not just this
  // one — Home and Health included.
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * The account these actions may write to.
 *
 * Always the one this person OWNS, never the active-account cookie. A family
 * member has that cookie pointing at her account, and while RLS would reject
 * every write below anyway, resolving the owned account here means the wrong
 * account is never even named in a query. Returns null for someone who owns
 * nothing, which is every family member.
 */
async function ownedAccountId(): Promise<string | null> {
  return (await getOwnedAccount())?.accountId ?? null;
}

export async function updateDisplayName(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return (await getMessages()).errors.enterName;

  const accountId = await ownedAccountId();
  if (!accountId) return await saveFailed();

  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ display_name: trimmed })
    .eq("id", accountId);
  if (error) return await saveFailed();

  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath("/health");
  return null;
}

export async function updateLanguage(language: string): Promise<string | null> {
  if (language !== "en" && language !== "hi") return await saveFailed();

  // A family member reads the app in whatever language THEY read, which is not
  // necessarily hers — a son in Delhi may well use English while she uses
  // Hindi. They own no account row to store it on and RLS would reject the
  // write, so their choice lives in the cookie alone: it holds for their
  // device and changes nothing about her account.
  const accountId = await ownedAccountId();
  if (accountId) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("accounts")
      .update({ language })
      .eq("id", accountId);
    if (error) return await saveFailed();
  }

  await setLocaleCookie(language);
  // Every screen is server-rendered in the old language right now, Home and
  // Health included — revalidating only /profile would leave her tapping
  // through a half-translated app.
  revalidatePath("/", "layout");
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
  const accountId = await ownedAccountId();
  if (!accountId) return await saveFailed();
  if (!path.startsWith(`${accountId}/`)) return await saveFailed();

  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ avatar_path: path })
    .eq("id", accountId);
  if (error) return await saveFailed();

  revalidatePath("/profile");
  revalidatePath("/profile/me");
  revalidatePath("/");
  revalidatePath("/health");
  return null;
}

/** Drops back to the Google picture. */
export async function removeAvatar(): Promise<string | null> {
  const accountId = await ownedAccountId();
  if (!accountId) return await saveFailed();

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
  if (error) return await saveFailed();

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
  if (!name) return { error: (await getMessages()).errors.enterTheirName };
  if (!relation) return { error: (await getMessages()).errors.chooseRelation };

  const accountId = await ownedAccountId();
  if (!accountId) return { error: await saveFailed() };

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const supabase = await createClient();
  const { error } = await supabase.from("family_invitations").insert({
    account_id: accountId,
    name,
    relation,
    token_hash: tokenHash,
  });
  if (error) return { error: await saveFailed() };

  revalidatePath("/profile");
  return { url: await inviteUrl(token) };
}

/** Where an invitation link points. */
async function inviteUrl(token: string): Promise<string> {
  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}/invite/${token}`;
}

/**
 * Sends a pending invitation again.
 *
 * The original link CANNOT be recovered — only its hash was ever stored, which
 * is the whole point — so resharing mints a new token and rotates the row onto
 * it. That has a useful side effect: the old link stops working the moment she
 * reshares, so a link sent to the wrong chat dies as soon as she sends the
 * right one. The 14 days start again too, since an invitation about to expire
 * is the usual reason to reshare in the first place.
 *
 * The invitation keeps its identity — same row, same name, same relation. This
 * is one person being asked again, not a second person.
 */
export async function reshareInvitation(
  id: string,
): Promise<{ url: string } | { error: string }> {
  const accountId = await ownedAccountId();
  if (!accountId) return { error: await saveFailed() };

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 14 * 86_400_000).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("family_invitations")
    .update({ token_hash: tokenHash, expires_at: expiresAt })
    .eq("id", id)
    .eq("account_id", accountId)
    // Never revive something already accepted or cancelled. An accepted
    // invitation has done its job; a cancelled one was withdrawn on purpose.
    .eq("status", "pending")
    .select("id");
  if (error) return { error: await saveFailed() };
  if (!data || data.length === 0) {
    return { error: (await getMessages()).invitations.noLongerValid };
  }

  revalidatePath("/profile");
  return { url: await inviteUrl(token) };
}

/** Withdraws an invitation that has not been accepted. */
export async function cancelInvitation(id: string): Promise<string | null> {
  const accountId = await ownedAccountId();
  if (!accountId) return await saveFailed();

  const supabase = await createClient();
  const { error } = await supabase
    .from("family_invitations")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("account_id", accountId)
    .eq("status", "pending");
  if (error) return await saveFailed();

  revalidatePath("/profile");
  return null;
}

/**
 * Ends someone's access.
 *
 * Removing the membership is what actually revokes it — every policy on this
 * account reads through account_members, so the row is the access.
 *
 * One row, one person. There is no group here, so revoking her son changes
 * nothing about her daughter — and the role filter means this can never remove
 * her own ownership by accident.
 */
export async function revokeAccess(userId: string): Promise<string | null> {
  const accountId = await ownedAccountId();
  if (!accountId) return await saveFailed();

  const supabase = await createClient();
  const { error } = await supabase
    .from("account_members")
    .delete()
    .eq("account_id", accountId)
    .eq("user_id", userId)
    .eq("role", "family");
  if (error) return (await getMessages()).errors.removeFailed;

  revalidatePath("/profile");
  return null;
}
