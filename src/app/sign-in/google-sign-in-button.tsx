"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Deliberately not a Button variant. Figma gives this a white fill with a
 * border/subtle stroke and a text/primary label, which matches none of the
 * three button styles — Tertiary uses a brand border and a brand label.
 * Flagged rather than forced into the closest variant.
 */
export function GoogleSignInButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
        {busy ? "Opening Google…" : "Continue with Google"}
      </span>
    </button>
  );
}
