"use client";

import { useActionState, useState } from "react";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { Button, Radio } from "@/components/ui";
import { saveLanguage } from "../actions";

/**
 * Radio-style here, tap-chips in Profile. That inconsistency between the two
 * screens is known and accepted — follow each screen as designed rather than
 * reconciling them.
 *
 * Two options only for P0. Marathi and Bengali were explicitly removed.
 */
const OPTIONS = [
  { value: "en", label: "English", native: "English" },
  { value: "hi", label: "Hindi", native: "हिन्दी" },
];

export function LanguageForm({ icon }: { icon: React.ReactNode }) {
  const [error, action, pending] = useActionState(saveLanguage, null);
  const [selected, setSelected] = useState("en");

  return (
    <form action={action}>
      <OnboardingScreen
        backHref="/onboarding/name"
        icon={icon}
        title="Which language are you comfortable with?"
        subtitle="You can change this later."
        footer={
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Next"}
          </Button>
        }
      >
        <div role="radiogroup" aria-label="Language" className="flex flex-col gap-3">
          {OPTIONS.map((o) => (
            <label
              key={o.value}
              className="bg-surface-default border-border-soft flex cursor-pointer items-center gap-3 rounded-xl border-[0.5px] p-4"
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
              <span className="flex flex-col">
                <span className="text-body-primary text-text-primary">{o.native}</span>
                {o.native !== o.label ? (
                  <span className="text-body-secondary text-text-secondary">{o.label}</span>
                ) : null}
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
