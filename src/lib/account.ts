import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Which account is currently being viewed.
 *
 * A person can hold the owner role on their own account and the family role on
 * someone else's, so "the current account" is a choice, not a lookup. It lives
 * in a cookie and is re-validated against account_members on every read — a
 * tampered cookie gets you nothing, because RLS still gates every query.
 */
const ACTIVE_ACCOUNT_COOKIE = "sakha_account";

export async function setActiveAccount(accountId: string) {
  const store = await cookies();
  store.set(ACTIVE_ACCOUNT_COOKIE, accountId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/**
 * The active account id, without the membership join.
 *
 * Every write already passes through RLS, which is the real guard — so for a
 * write path we can trust the cookie and let the database reject it if it's
 * wrong, rather than spending a round trip proving it first.
 */
export async function getActiveAccountId(): Promise<string | null> {
  const store = await cookies();
  const fromCookie = store.get(ACTIVE_ACCOUNT_COOKIE)?.value;
  if (fromCookie) return fromCookie;
  const owned = await getOwnedAccount();
  return owned?.accountId ?? null;
}

export type Membership = {
  accountId: string;
  displayName: string;
  language: string;
  /** Her own photo in the avatars bucket. Null means fall back to Google's. */
  avatarPath: string | null;
  role: "owner" | "family";
  /**
   * How the owner described them when inviting: "Son". Null on an account they
   * own themselves — nobody is a relation to their own account.
   */
  relation: string | null;
};

/**
 * Who is asking, and what they can see — in one round trip.
 *
 * Both halves used to be awaited one after the other on every page: the auth
 * check, then the memberships query, each its own trip to Mumbai. They do not
 * depend on each other — the memberships query authenticates itself, because
 * RLS reads auth.uid() straight from the JWT — so they run together instead.
 *
 * Wrapped in React's cache() so that a page, its layout and any component
 * below them all share a single result per request rather than each paying for
 * their own.
 */
export const getViewer = cache(async () => {
  const supabase = await createClient();
  const [userResult, membershipResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("account_members")
      // user_id is selected so the rows can be narrowed to THIS person below.
      // It cannot be filtered in the query itself without first awaiting
      // getUser(), and these two deliberately run together.
      .select("user_id, role, relation, accounts(id, display_name, language, avatar_path)")
      .order("created_at", { ascending: true }),
  ]);

  const user = userResult.data.user;

  /**
   * Only this person's own rows.
   *
   * members_select is is_account_member(account_id), which is correct — the
   * Family list on Profile needs to read everyone on the account. But it means
   * this query also returns OTHER people's membership rows, and mapping those
   * into "your memberships" gets their role attributed to you.
   *
   * That was not theoretical. An account has its owner's row first (created
   * with the account) and the family member's second (created on acceptance),
   * so for every real family member the first row matching their active
   * account was the OWNER's — they were handed her Home, with Confirm and
   * Record on it. The writes still failed at RLS, so nothing could be changed,
   * but every control on the screen was a dead end.
   */
  const memberships: Membership[] = (membershipResult.data ?? []).flatMap((row) => {
    if (!user || row.user_id !== user.id) return [];
    const a = row.accounts as unknown as
      | { id: string; display_name: string; language: string; avatar_path: string | null }
      | null;
    if (!a) return [];
    return [
      {
        accountId: a.id,
        displayName: a.display_name,
        language: a.language,
        avatarPath: a.avatar_path,
        role: row.role,
        relation: row.relation,
      },
    ];
  });

  return { user, memberships };
});

export async function getMemberships(): Promise<Membership[]> {
  return (await getViewer()).memberships;
}

/**
 * The account this user owns, if any.
 *
 * Distinct from getActiveAccount: a person can be a family member on someone
 * else's account while owning none of their own, and onboarding must only ever
 * act on their own.
 */
export async function getOwnedAccount(): Promise<Membership | null> {
  const memberships = await getMemberships();
  return memberships.find((m) => m.role === "owner") ?? null;
}

/** The active account, or null if the user has none yet (mid-onboarding). */
export async function getActiveAccount(): Promise<Membership | null> {
  const { memberships } = await getViewer();
  if (memberships.length === 0) return null;

  const store = await cookies();
  const preferred = store.get(ACTIVE_ACCOUNT_COOKIE)?.value;
  // Never trust the cookie on its own — only honour it if it names an account
  // this user is actually a member of.
  return memberships.find((m) => m.accountId === preferred) ?? memberships[0];
}

/**
 * The gate every signed-in screen sits behind.
 *
 * One call, one round trip. Both branches redirect rather than returning null,
 * so a page that gets past this line always has a real account to render and
 * never has to guard again further down.
 *
 * Signed out and signed-in-but-not-set-up are different situations and go to
 * different places: the first has nothing yet, the second is mid-onboarding.
 */
export async function requireAccount(): Promise<{
  account: Membership;
  /** False for a family member: they read everything and change nothing. */
  canEdit: boolean;
  /**
   * True when this is somebody else's account being viewed.
   *
   * The inverse of canEdit today, and named separately on purpose: canEdit
   * answers "may this control exist", isFamily answers "which screen is this".
   * They are the same boolean and different questions — Home branches on the
   * second to render an entirely different screen, not the owner's with things
   * taken away.
   */
  isFamily: boolean;
}> {
  const { user } = await getViewer();
  if (!user) redirect("/welcome");

  // Reads the same cached getViewer() result — no second trip.
  const account = await getActiveAccount();
  if (!account) redirect("/onboarding/name");

  return {
    account,
    canEdit: account.role === "owner",
    isFamily: account.role !== "owner",
  };
}

/**
 * The gate on a screen only the owner may see.
 *
 * A family member sent here is not shown an error — there is nothing wrong
 * with them being curious, and a dead end helps nobody. They go to their own
 * Home instead.
 */
/**
 * The active account id, but only if this person OWNS it.
 *
 * For a server action that edits or deletes. RLS already refuses these — an
 * owner-only policy makes a family member's UPDATE match zero rows — but zero
 * rows is not an error, so the action would report success having done
 * nothing. Failing here turns that into something we can actually say.
 */
export async function getOwnedActiveAccountId(): Promise<string | null> {
  const account = await getActiveAccount();
  return account && account.role === "owner" ? account.accountId : null;
}

export async function requireOwner(): Promise<Membership> {
  const { account, canEdit } = await requireAccount();
  if (!canEdit) redirect("/");
  return account;
}
