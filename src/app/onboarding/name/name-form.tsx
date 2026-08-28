"use client";

import { useActionState } from "react";
import { User } from "lucide-react";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { Button, TextInput } from "@/components/ui";
import { saveName } from "../actions";
import { useT } from "@/lib/i18n/client";

export function NameForm({ defaultName }: { defaultName: string }) {
  const t = useT();
  const [error, action, pending] = useActionState(saveName, null);

  return (
    <form action={action} className="flex min-h-0 flex-1 flex-col">
      <OnboardingScreen
        icon={<User size={60} className="text-action-primary" aria-hidden />}
        title={t.onboarding.nameTitle}
        subtitle={t.onboarding.nameSubtitle}
        footer={
          <Button type="submit" disabled={pending}>
            {pending ? t.common.saving : t.common.next}
          </Button>
        }
      >
        {/* Figma labels this "You Name" — corrected to "Your Name". */}
        <TextInput
          label={t.onboarding.nameLabel}
         
          name="name"
          defaultValue={defaultName}
          placeholder={t.onboarding.namePlaceholder}
          autoComplete="name"
          autoFocus
          required
        />
        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error">{error}</p>
        ) : null}
      </OnboardingScreen>
    </form>
  );
}
