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
  role: "owner" | "family";
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
      .select("role, accounts(id, display_name, language)")
      .order("created_at", { ascending: true }),
  ]);

  const memberships: Membership[] = (membershipResult.data ?? []).flatMap((row) => {
    const a = row.accounts as unknown as
      | { id: string; display_name: string; language: string }
      | null;
    if (!a) return [];
    return [{ accountId: a.id, displayName: a.display_name, language: a.language, role: row.role }];
  });

  return { user: userResult.data.user, memberships };
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
export async function requireAccount(): Promise<{ account: Membership }> {
  const { user } = await getViewer();
  if (!user) redirect("/welcome");

  // Reads the same cached getViewer() result — no second trip.
  const account = await getActiveAccount();
  if (!account) redirect("/onboarding/name");

  return { account };
}
