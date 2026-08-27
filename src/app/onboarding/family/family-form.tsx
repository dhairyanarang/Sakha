"use client";

import { useActionState, useState } from "react";
import { Users } from "lucide-react";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { Button, Chip, TextInput } from "@/components/ui";
import { saveContact } from "../actions";

const RELATIONS = ["Spouse", "Son", "Daughter"];

/** Field labels are 14px Medium at rgba(0,0,0,0.6) resolved to a solid value. */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[14px] leading-[1.2] font-medium text-[#636366]">{children}</span>
  );
}

export function FamilyForm({ justAdded }: { justAdded: boolean }) {
  const [error, action, pending] = useActionState(saveContact, null);
  const [relation, setRelation] = useState("");

  return (
    <form action={action}>
      <OnboardingScreen
        backHref="/onboarding/language"
        skipHref="/onboarding/medicine"
        icon={<Users size={60} className="text-action-primary" aria-hidden />}
        title="Invite your Family to show them your progress"
        subtitle="You can change this later."
        footer={
          <>
            <Button type="submit" name="intent" value="next" disabled={pending}>
              {pending ? "Saving…" : "Next"}
            </Button>
            <Button type="submit" name="intent" value="another" variant="ghost" disabled={pending}>
              Add Another Member
            </Button>
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

        <div className="flex flex-col gap-2.5">
          <FieldLabel>Relationship</FieldLabel>
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
