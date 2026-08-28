"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { Bell, Languages } from "lucide-react";
import { Chip, SectionHeading, Toast, Toggle } from "@/components/ui";
import { updateLanguage } from "@/app/profile/actions";
import { useT } from "@/lib/i18n/client";
import { LANGUAGE_NAMES, LOCALES } from "@/lib/i18n";

/**
 * Preferences: reminders and language.
 *
 * The notification row reflects the browser's own permission, which is the
 * only thing that can honestly be shown today — the reminders table and the
 * scheduled push that would drive it belong to Phase 7. Turning it on asks the
 * browser; turning it off is something only her phone's settings can do, so
 * the row says that rather than pretending the switch controls it.
 *
 * Language is tap-chips here and radio buttons in onboarding. That difference
 * is deliberate and recorded in the IA — each screen follows its own design.
 */
/**
 * Each language names ITSELF, always. Showing "Hindi" in English to someone
 * who reads only Hindi is exactly backwards — she has to recognise her own
 * language in a script she may not read to switch into it.
 */
const LANGUAGES = LOCALES.map((value) => ({
  value,
  label: LANGUAGE_NAMES[value],
  native: value !== "en",
}));

export function Preferences({ language }: { language: string }) {
  const t = useT();
  const [selected, setSelected] = useState(language);
  /**
   * Read the browser's permission without an effect, so the server renders
   * "unsupported" and the client corrects it during hydration rather than
   * flashing the wrong state or tripping over a mismatch. Nothing broadcasts
   * a change to this, so there is nothing to subscribe to — the override below
   * covers the one case that does change it, her answering the prompt.
   */
  const browserPermission = useSyncExternalStore(
    () => () => {},
    () => (typeof Notification !== "undefined" ? Notification.permission : "unsupported"),
    () => "unsupported" as const,
  );
  const [asked, setAsked] = useState<NotificationPermission | null>(null);
  const permission = asked ?? browserPermission;
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function choose(value: string) {
    setSelected(value);
    startTransition(async () => {
      const err = await updateLanguage(value);
      setToast(err ?? t.profile.languageUpdated);
    });
  }

  async function toggleReminders() {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "granted") {
      setToast(t.profile.remindersOffHint);
      return;
    }
    try {
      setAsked(await Notification.requestPermission());
    } catch {
      // A browser that will not ask is a normal outcome, not an error.
    }
  }

  const remindersOn = permission === "granted";

  return (
    <section className="flex shrink-0 flex-col gap-3">
      <SectionHeading>{t.profile.preferences}</SectionHeading>

      <div className="bg-surface-default border-border-soft flex flex-col gap-[18px] rounded-xl border-[0.5px] px-4 py-[18px]">
        <div className="flex items-center gap-4">
          <Bell size={22} className="text-text-primary shrink-0" aria-hidden />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="text-text-primary text-[18px] leading-[1.2] font-medium">
              {t.profile.notification}
            </p>
            {/* rgba(0,0,0,0.4) over surface/default, resolved to a solid. */}
            <p className="text-[16px] leading-[1.2] text-[#999999]">
              {t.profile.remindersOn(remindersOn ? t.profile.on : t.profile.off)}
            </p>
          </div>
          <Toggle
            checked={remindersOn}
            onCheckedChange={toggleReminders}
            aria-label={t.profile.remindersLabel}
          />
        </div>

        <div className="border-border-default mx-auto w-[299px] border-t" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Languages size={22} className="text-text-primary shrink-0" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="text-text-primary text-[18px] leading-[1.2] font-medium">
                {t.profile.language}
              </p>
              <p className="text-[16px] leading-[1.2] text-[#999999]">
                {LANGUAGE_NAMES[selected as keyof typeof LANGUAGE_NAMES] ?? selected}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <Chip
                key={l.value}
                selected={selected === l.value}
                onClick={() => choose(l.value)}
                /* Devanagari needs the extra size to stay as legible, the same
                   allowance the onboarding language step makes. */
                className={l.native ? "text-[18px]" : undefined}
              >
                {l.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <Toast message={toast ?? ""} open={toast !== null} onDone={() => setToast(null)} />
    </section>
  );
}
