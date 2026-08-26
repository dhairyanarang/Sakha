"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { Button, Chip, TextInput } from "@/components/ui";
import { saveContact } from "../actions";

const RELATIONS = ["Spouse", "Son", "Daughter"];

export function FamilyForm({
  icon,
  justAdded,
}: {
  icon: React.ReactNode;
  justAdded: boolean;
}) {
  const [error, action, pending] = useActionState(saveContact, null);
  const [relation, setRelation] = useState("");

  return (
    <form action={action}>
      <OnboardingScreen
        backHref="/onboarding/language"
        icon={icon}
        title="Invite your Family to show them your progress"
        subtitle="You can change this later."
        footer={
          <>
            <Button type="submit" name="intent" value="next" disabled={pending}>
              {pending ? "Saving…" : "Next"}
            </Button>
            <Button type="submit" name="intent" value="another" variant="secondary" disabled={pending}>
              Add Another Member
            </Button>
            {/* A real skip, not soft-blocked. */}
            <Link
              href="/onboarding/medicine"
              className="text-body-medium text-action-primary flex h-[44px] items-center justify-center"
            >
              Skip
            </Link>
          </>
        }
      >
        {justAdded ? (
          <p className="text-body-secondary text-feedback-success-text">
            Saved. You can add another below.
          </p>
        ) : null}
        <TextInput label="Name" name="name" placeholder="Rahul Sharma" autoComplete="name" />
        <TextInput
          label="Phone Number"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="+91 98765 43210"
          autoComplete="tel"
        />
        <div className="flex flex-col gap-2">
          <span className="text-body-secondary text-text-secondary">Relationship</span>
          <input type="hidden" name="relation" value={relation} />
          <div className="flex flex-wrap gap-2">
            {RELATIONS.map((r) => (
              <Chip
                key={r}
                selected={relation === r}
                onClick={() => setRelation(relation === r ? "" : r)}
              >
                {r}
              </Chip>
            ))}
          </div>
        </div>
        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error">{error}</p>
        ) : null}
      </OnboardingScreen>
    </form>
  );
}
