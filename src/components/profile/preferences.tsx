"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { Bell, Languages } from "lucide-react";
import { Chip, SectionHeading, Toast, Toggle } from "@/components/ui";
import { updateLanguage } from "@/app/profile/actions";
import { savePushSubscription } from "@/app/actions/push";
import { enablePush } from "@/lib/push";
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

export function Preferences({
  language,
  /**
   * False on a family member's Profile. The row asks the browser for
   * permission to push HER medicine reminders; nothing yet notifies a family
   * member about anything, and a switch that promises otherwise is worse than
   * no switch.
   */
  showReminders = true,
  updatesVoice = false,
}: {
  language: string;
  showReminders?: boolean;
  /**
   * A family member is switching on updates ABOUT HER — her readings, her
   * medicines — not reminders for themselves. Same switch, same permission,
   * different thing being promised.
   */
  updatesVoice?: boolean;
}) {
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

  /**
   * The only place notifications are ever requested — from her tap, never on
   * load. Turning them ON also registers this device for push; turning them
   * off is something only the phone's settings can do, so the row says that.
   */
  async function toggleReminders() {
    if (typeof Notification === "undefined") {
      setToast(t.profile.remindersUnsupported);
      return;
    }

    /**
     * Permission granted is NOT the same as registered.
     *
     * This used to return early whenever permission was already granted, on
     * the assumption that granted meant set up. It does not: a device that
     * allowed notifications before this device ever stored a PushSubscription
     * — which is every device that granted permission under an older build —
     * has permission and no way to be reached. It would tap the toggle, be
     * told reminders were already on, and go on receiving nothing.
     *
     * So always make sure a subscription exists. enablePush reuses the
     * browser's existing one when there is one, so this costs a repeat tap
     * nothing and repairs a device that was stranded.
     */
    const wasGranted = Notification.permission === "granted";
    const result = await enablePush(selected, savePushSubscription);
    if (result.status === "subscribed") {
      setAsked("granted");
      // Nothing changed for her if it was already allowed — and only her
      // phone's settings can turn it back off, so the row says that.
      setToast(wasGranted ? t.profile.remindersOffHint : t.profile.remindersOn2);
    } else if (result.status === "needs-install") {
      setToast(t.profile.remindersNeedInstall);
    } else if (result.status === "denied") {
      setAsked("denied");
      setToast(t.profile.remindersDenied);
    } else {
      setToast(t.profile.remindersUnsupported);
    }
  }

  const remindersOn = permission === "granted";

  return (
    <section className="flex shrink-0 flex-col gap-3">
      <SectionHeading>{t.profile.preferences}</SectionHeading>

      <div className="bg-surface-default border-border-soft flex flex-col gap-[18px] rounded-xl border-[0.5px] px-4 py-[18px]">
        {showReminders ? (
          <>
            <div className="flex items-center gap-4">
              <Bell size={22} className="text-text-primary shrink-0" aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="text-text-primary text-[18px] leading-[1.2] font-medium">
                  {t.profile.notification}
                </p>
                {/* rgba(0,0,0,0.4) over surface/default, resolved to a solid. */}
                <p className="text-[16px] leading-[1.2] text-[#999999]">
                  {(updatesVoice ? t.profile.updatesOn : t.profile.remindersOn)(
                remindersOn ? t.profile.on : t.profile.off,
              )}
                </p>
              </div>
              <Toggle
                checked={remindersOn}
                onCheckedChange={toggleReminders}
                aria-label={t.profile.remindersLabel}
              />
            </div>

            <div className="border-border-default mx-auto w-full max-w-[299px] border-t" />
          </>
        ) : null}

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
