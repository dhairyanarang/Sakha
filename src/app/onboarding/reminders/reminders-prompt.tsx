"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { Button, InfoCallout } from "@/components/ui";

/**
 * Permission is requested, never assumed. Push is best-effort by the nature of
 * the web platform — the home screen stays the authoritative view of what's
 * due whether or not a notification ever arrives.
 */
export function RemindersPrompt({ icon }: { icon: React.ReactNode }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function allow() {
    setBusy(true);
    try {
      if (typeof Notification !== "undefined") {
        await Notification.requestPermission();
      }
    } catch {
      // Declining, or a browser that won't ask, is a normal outcome — not an
      // error worth showing her. Subscription happens later regardless.
    }
    router.push("/");
  }

  return (
    <OnboardingScreen
      backHref="/onboarding/medicine"
      icon={icon}
      title="Stay on track with reminders"
      subtitle="Sakha can remind you about medicines and things you plan for the day."
      footer={
        <>
          <Button onClick={allow} disabled={busy}>
            Allow Reminders
          </Button>
          <Button variant="secondary" onClick={() => router.push("/")} disabled={busy}>
            Not now
          </Button>
        </>
      }
    >
      <InfoCallout>You can change this anytime from your phone later.</InfoCallout>
    </OnboardingScreen>
  );
}
