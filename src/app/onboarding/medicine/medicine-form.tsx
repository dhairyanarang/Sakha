"use client";

import { useActionState, useState } from "react";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { Button, Chip, TextInput } from "@/components/ui";
import { AddedList } from "@/components/onboarding/added-list";
import { saveMedicine } from "../actions";
import type { Enums } from "@/lib/supabase/types";
import { useI18n } from "@/lib/i18n/client";
import { slotName } from "@/lib/today";

/**
 * Same fields and same optionality as the standalone Add Medicine flow inside
 * Health — deliberately identical, not a reduced onboarding variant.
 *
 * This is the one screen with no icon and a left-aligned header.
 */
const TIMES: Enums<"time_of_day">[] = ["morning", "afternoon", "evening"];

/**
 * The stored value stays English whatever she is reading — it is the canonical
 * tag on the row, and the label beside it is only how it is shown.
 */
const CONDITIONS = ["Sugar", "BP", "Acidity", "Thyroid", "Asthma"] as const;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[14px] leading-[1.2] font-medium text-[#636366]">{children}</span>
  );
}

export function MedicineForm({
  justAdded,
  existing,
}: {
  justAdded: boolean;
  existing: { id: string; name: string; times_of_day: string[] }[];
}) {
  const { t, locale } = useI18n();
  const CONDITION_LABEL: Record<(typeof CONDITIONS)[number], string> = {
    Sugar: t.medicines.conditions.sugar,
    BP: t.medicines.conditions.bp,
    Acidity: t.medicines.conditions.acidity,
    Thyroid: t.medicines.conditions.thyroid,
    Asthma: t.medicines.conditions.asthma,
  };
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
    <form action={action} className="flex min-h-0 flex-1 flex-col">
      <OnboardingScreen
        align="start"
        backHref="/onboarding/language"
        skipHref="/onboarding/reminders"
        title={t.onboarding.medicineTitle}
        subtitle={t.onboarding.medicineSubtitle}
        footer={
          <>
            <Button type="submit" name="intent" value="next" disabled={pending}>
              {pending ? t.common.saving : t.common.next}
            </Button>
            <Button type="submit" name="intent" value="another" variant="ghost" disabled={pending} className="h-[48px]">
              {t.onboarding.addAnother}
            </Button>
          </>
        }
      >
        <AddedList
          items={existing.map((m) => ({
            id: m.id,
            primary: m.name,
            secondary: m.times_of_day
              .map((slot) => slotName(slot as Enums<"time_of_day">, locale))
              .join(", "),
          }))}
        />
        {justAdded ? (
          <p className="text-body-secondary text-feedback-success-text">
            {t.onboarding.savedAddAnother}
          </p>
        ) : null}

        <TextInput
          label={t.medicines.medicineNameLabel}
          name="name"
          placeholder={t.medicines.medicineNamePlaceholderShort}
        />

        <div className="flex flex-col gap-2.5">
          <FieldLabel>{t.medicines.whenDoYouTakeIt}</FieldLabel>
          {times.map((t) => (
            <input key={t} type="hidden" name="times_of_day" value={t} />
          ))}
          <div className="flex flex-wrap gap-2">
            {TIMES.map((slot) => (
              <Chip
                key={slot}
                selected={times.includes(slot)}
                onClick={() => toggleTime(slot)}
              >
                {slotName(slot, locale)}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Optional — never blocks saving. */}
          <FieldLabel>{t.medicines.whatIsItFor}</FieldLabel>
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
                {CONDITION_LABEL[c]}
              </Chip>
            ))}
            <Chip
             
              selected={custom}
              onClick={() => {
                setCustom(!custom);
                setCondition("");
              }}
            >
              {t.medicines.customChip}
            </Chip>
          </div>
          {custom ? (
            <TextInput
              label={t.medicines.conditionLabel}
              name="condition_tag"
              placeholder={t.medicines.conditionPlaceholder}
            />
          ) : null}
        </div>

        <TextInput
          label={t.medicines.remarksLabel}
          name="remarks"
          placeholder={t.medicines.remarksPlaceholder}
        />

        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error">{error}</p>
        ) : null}
      </OnboardingScreen>
    </form>
  );
}
