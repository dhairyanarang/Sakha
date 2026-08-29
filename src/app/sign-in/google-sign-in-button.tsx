"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n/client";

/**
 * Deliberately not a Button variant. Figma gives this a white fill with a
 * border/subtle stroke and a text/primary label, which matches none of the
 * three button styles — Tertiary uses a brand border and a brand label.
 * Flagged rather than forced into the closest variant.
 */
/** Where to go once Google has answered. A path on this site, or nothing. */
const AFTER_SIGNIN_COOKIE = "sakha_after_signin";

export function GoogleSignInButton({ next }: { next?: string | null }) {
  const router = useRouter();
  const t = useT();
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);

    /**
     * Remember where they were going, in a cookie rather than on redirect_to.
     *
     * An invitation and a tapped notification both send a signed-out person
     * through /sign-in?next=… and expect to get them back afterwards. That
     * never worked: the destination was read by the callback but nothing ever
     * put it there, so an invited family member signed in and landed on Home
     * with no idea where their invitation had gone.
     *
     * It rides in a cookie because redirect_to has to keep matching Supabase's
     * redirect allow list exactly, and appending a query string to the one URL
     * that sign-in depends on is not worth the risk. SameSite=Lax still
     * arrives on the top-level GET that Google sends us back with.
     */
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      // Secure on https, absent on localhost, where the attribute would stop
      // the cookie being stored at all.
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
    if (error) {
      setBusy(false);
      router.push("/sign-in?error=sign_in_failed");
    }
  }

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={busy}
      className="bg-surface-default border-border-subtle text-text-primary flex h-[60px] w-full items-center justify-center gap-6 rounded-xl border transition-colors active:bg-[rgb(0_0_0/0.03)] disabled:opacity-60"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/onboarding/google.svg" alt="" width={32} height={32} className="size-8" />
      <span className="text-[18px] leading-[1.2] font-medium">
        {busy ? t.signIn.openingGoogle : t.signIn.continueWithGoogle}
      </span>
    </button>
  );
}
