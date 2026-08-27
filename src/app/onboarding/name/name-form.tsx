"use client";

import { useActionState } from "react";
import { User } from "lucide-react";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { Button, TextInput } from "@/components/ui";
import { saveName } from "../actions";

export function NameForm({ defaultName }: { defaultName: string }) {
  const [error, action, pending] = useActionState(saveName, null);

  return (
    <form action={action}>
      <OnboardingScreen
        icon={<User size={60} className="text-action-primary" aria-hidden />}
        title="What should we call you?"
        subtitle="This will be your name in Sakha."
        footer={
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Next"}
          </Button>
        }
      >
        {/* Figma labels this "You Name" — corrected to "Your Name". */}
        <TextInput
          label="Your Name"
         
          name="name"
          defaultValue={defaultName}
          placeholder="Asha Sharma"
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
