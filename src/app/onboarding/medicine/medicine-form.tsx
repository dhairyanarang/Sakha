"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { Button, Chip, TextInput } from "@/components/ui";
import { saveMedicine } from "../actions";
import type { Enums } from "@/lib/supabase/types";

/**
 * Same fields and same optionality as the standalone Add Medicine flow inside
 * Health — deliberately identical, not a reduced onboarding variant.
 */
const TIMES: { value: Enums<"time_of_day">; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

const CONDITIONS = ["Sugar", "BP", "Acidity", "Thyroid", "Asthma"];

export function MedicineForm({ justAdded }: { justAdded: boolean }) {
  const [error, action, pending] = useActionState(saveMedicine, null);
  // Multi-select: Morning AND Evening on one entry. An earlier draft made you
  // add the medicine twice; that requirement is gone.
  const [times, setTimes] = useState<Enums<"time_of_day">[]>([]);
  const [condition, setCondition] = useState("");
  const [custom, setCustom] = useState(false);

  function toggleTime(v: Enums<"time_of_day">) {
    setTimes((cur) => (cur.includes(v) ? cur.filter((t) => t !== v) : [...cur, v]));
  }

  return (
    <form action={action}>
      <OnboardingScreen
        backHref="/onboarding/family"
        title="Let’s add your Medicine"
        subtitle="Please add the medicines you take regularly"
        footer={
          <>
            <Button type="submit" name="intent" value="next" disabled={pending}>
              {pending ? "Saving…" : "Next"}
            </Button>
            <Button type="submit" name="intent" value="another" variant="secondary" disabled={pending}>
              Add Another Medicine
            </Button>
            <Link
              href="/onboarding/reminders"
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

        <TextInput label="Medicine Name" name="name" placeholder="Gliptagrate" />

        <div className="flex flex-col gap-2">
          <span className="text-body-secondary text-text-secondary">When do you take it?</span>
          {times.map((t) => (
            <input key={t} type="hidden" name="times_of_day" value={t} />
          ))}
          <div className="flex flex-wrap gap-2">
            {TIMES.map((t) => (
              <Chip key={t.value} selected={times.includes(t.value)} onClick={() => toggleTime(t.value)}>
                {t.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Optional — never blocks saving. */}
          <span className="text-body-secondary text-text-secondary">
            What is the medicine for?
          </span>
          {!custom ? <input type="hidden" name="condition_tag" value={condition} /> : null}
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <Chip
                key={c}
                selected={!custom && condition === c}
                onClick={() => {
                  setCustom(false);
                  setCondition(condition === c ? "" : c);
                }}
              >
                {c}
              </Chip>
            ))}
            <Chip selected={custom} onClick={() => { setCustom(!custom); setCondition(""); }}>
              + Custom
            </Chip>
          </div>
          {custom ? (
            <div className="mt-2">
              <TextInput label="Condition" name="condition_tag" placeholder="Type a condition" />
            </div>
          ) : null}
        </div>

        <TextInput label="Remarks (optional)" name="remarks" placeholder="Add Remarks" />

        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error">{error}</p>
        ) : null}
      </OnboardingScreen>
    </form>
  );
}
