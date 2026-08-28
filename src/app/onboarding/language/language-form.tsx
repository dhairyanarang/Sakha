"use client";

import { useActionState, useState } from "react";
import { Languages } from "lucide-react";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { Button, Radio } from "@/components/ui";
import { saveLanguage } from "../actions";
import { LANGUAGE_NAMES } from "@/lib/i18n";
import { useT } from "@/lib/i18n/client";

/**
 * Radio-style here, tap-chips in Profile. That inconsistency between the two
 * screens is known and accepted — each follows its own design.
 *
 * Two options only for P0. Marathi and Bengali were explicitly removed.
 * हिन्दी is set at 18px against English's 16px, as authored: Devanagari needs
 * the extra size to stay as legible.
 */
/**
 * Each option is written in the language it offers — she has to be able to
 * recognise her own language here without already reading the other one. The
 * roman spelling underneath is the bridge between the two.
 */
const OPTIONS = [
  { value: "en", native: LANGUAGE_NAMES.en, latin: "English", nativeSize: "text-[16px]" },
  { value: "hi", native: LANGUAGE_NAMES.hi, latin: "Hindi", nativeSize: "text-[18px]" },
];

export function LanguageForm({ defaultLanguage }: { defaultLanguage: string }) {
  const t = useT();
  const [error, action, pending] = useActionState(saveLanguage, null);
  const [selected, setSelected] = useState(defaultLanguage);

  return (
    <form action={action} className="flex min-h-0 flex-1 flex-col">
      <OnboardingScreen
        backHref="/onboarding/name"
        icon={<Languages size={60} className="text-action-primary" aria-hidden />}
        title={t.onboarding.languageTitle}
        subtitle={t.onboarding.languageSubtitle}
        footer={
          <Button type="submit" disabled={pending}>
            {pending ? t.common.saving : t.common.next}
          </Button>
        }
      >
        <div role="radiogroup" aria-label={t.onboarding.languageGroupLabel} className="flex flex-col gap-2.5">
          {OPTIONS.map((o) => (
            <label
              key={o.value}
              className="bg-surface-default border-border-soft flex cursor-pointer items-center gap-4 rounded-xl border-[0.5px] px-4 py-6"
            >
              <input
                type="radio"
                name="language"
                value={o.value}
                checked={selected === o.value}
                onChange={() => setSelected(o.value)}
                className="sr-only"
              />
              <Radio selected={selected === o.value} />
              <span className="flex flex-1 flex-col gap-1">
                <span className={`${o.nativeSize} text-text-primary leading-[1.3] font-medium`}>
                  {o.native}
                </span>
                <span className="text-[14px] leading-[1.3] text-[#959599]">{o.latin}</span>
              </span>
            </label>
          ))}
        </div>
        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error">{error}</p>
        ) : null}
      </OnboardingScreen>
    </form>
  );
}
