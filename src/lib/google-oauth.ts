"use client";

import { createClient } from "@/lib/supabase/client";

/** Where to go once Google has answered. A path on this site, or nothing. */
export const AFTER_SIGNIN_COOKIE = "sakha_after_signin";

/**
 * Start Google, the one way Sakha ever does it.
 *
 * Shared by the sign-in screen and by Switch account so the two cannot drift
 * apart — particularly on `prompt`, which is the whole reason Google shows its
 * account chooser rather than an email box.
 *
 * Sakha never reads or lists the accounts on the device. It asks Google to
 * choose and Google owns that screen entirely, including "Use another
 * account". Where Google has no session in this context it will show its
 * normal sign-in instead, which is the correct outcome and not ours to work
 * around.
 */
export async function startGoogleOAuth(options?: { next?: string | null }): Promise<Error | null> {
  const next = options?.next;

  /**
   * Remember where they were going, in a cookie rather than on redirect_to.
   *
   * redirect_to has to keep matching Supabase's redirect allow list exactly,
   * and appending a query string to the one URL every sign-in depends on is
   * not a risk worth taking. SameSite=Lax still arrives on the top-level GET
   * that Google sends us back with.
   */
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie =
      `${AFTER_SIGNIN_COOKIE}=${encodeURIComponent(next)}; path=/; max-age=600; samesite=lax${secure}`;
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      // Without this Google silently reuses the last session, which on a
      // shared or multi-account phone means typing an address instead of
      // picking a face from a list.
      queryParams: { prompt: "select_account" },
    },
  });
  return error ?? null;
}
