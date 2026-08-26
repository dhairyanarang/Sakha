"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

export function GoogleSignInButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Must be absolute, and must be listed in Supabase's redirect
        // allow-list or the provider refuses the round trip.
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setBusy(false);
      router.push("/sign-in?error=sign_in_failed");
    }
  }

  return (
    <Button onClick={signIn} disabled={busy}>
      {busy ? "Opening Google…" : "Continue with Google"}
    </Button>
  );
}
