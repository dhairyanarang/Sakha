"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { Button } from "@/components/ui";
import { useT } from "@/lib/i18n/client";

/**
 * Permission is requested, never assumed. Push is best-effort by the nature of
 * the web platform — the home screen stays the authoritative view of what's
 * due whether or not a notification ever arrives.
 */
export function RemindersPrompt() {
  const router = useRouter();
  const t = useT();
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
      skipHref="/"
      icon={<Bell size={60} className="text-action-primary" aria-hidden />}
      title={t.onboarding.remindersTitle}
      subtitle={t.onboarding.remindersSubtitle}
      /* "Not now" is gone: the top-right Skip is the single way past this
         screen, so there aren't two competing ways to decline. */
      footer={
        <Button onClick={allow} disabled={busy}>
          {t.onboarding.allowReminders}
        </Button>
      }
    >
      {/* Same family as the sign-in privacy note, but roomier padding and a
          Medium label. Two variants of one pattern — flagged. */}
      <div className="flex items-center justify-center gap-4 rounded-md bg-[rgb(85_81_255/0.08)] px-4 py-5">
        <BellRing size={24} className="text-action-primary shrink-0" aria-hidden />
        <p className="text-action-primary flex-1 text-[16px] leading-[1.4] font-medium">
          {t.onboarding.remindersFootnote}
        </p>
      </div>
    </OnboardingScreen>
  );
}
