import Link from "next/link";
import { ChevronRight, Droplet, HeartPulse, Pill, Weight } from "lucide-react";
import { IconCircle, SectionHeading } from "@/components/ui";
import { MeasurementRow } from "@/components/health/measurement-row";
import { relativeWhen } from "@/lib/today";
import { getT } from "@/lib/i18n/server";
import type { FamilyHome } from "@/lib/family-data";

/**
 * Health Overview — the things worth knowing, each a way in.
 *
 * The same rows the owner sees on her Health screen, reused rather than
 * reimplemented, because the READING of a measurement is identical whoever is
 * looking. What differs is everything around them: no Record button, no Add
 * tile, and the medicines row is a count rather than a list to confirm
 * against.
 *
 * Every row still navigates. A family member who wants the history of her
 * blood pressure gets the same detail screen she does, minus the controls.
 *
 * `medicines` is null on the Health screen, where the Medicines card already
 * sits directly above this and the row would be the same thing said twice.
 * Home has no such card, so there it leads.
 */
export async function FamilyHealthOverview({
  latest,
  medicines,
  heading,
  note,
}: {
  latest: FamilyHome["latest"];
  medicines: FamilyHome["medicines"] | null;
  heading: string;
  /**
   * One line under the heading. The Health page uses it to say that tapping a
   * reading leads somewhere he can add one — the rows themselves carry no
   * Record button, and without this the only affordance is a chevron.
   */
  note?: string;
}) {
  const { t, locale } = await getT();
  const sugar = latest.blood_sugar;
  const bp = latest.blood_pressure;
  const weight = latest.weight;

  /**
   * Today's medicines as one honest line.
   *
   * "2 of 3 confirmed" counts only doses that have already come around — at
   * nine in the morning an evening tablet is not outstanding, and saying so
   * would invent a worry out of an ordinary Tuesday.
   */
  const medicineLine = !medicines
    ? null
    : medicines.activeCount === 0
      ? t.family.noMedicines
      : medicines.due === 0
        ? t.family.nothingDueYet
        : t.family.confirmedOfDue(medicines.confirmed, medicines.due);

  return (
    <section className="flex shrink-0 flex-col gap-2.5">
      <SectionHeading>{heading}</SectionHeading>
      {note ? (
        /* rgba(0,0,0,0.6) over surface/page, resolved to a solid value. */
        <p className="-mt-1 text-[14px] leading-[1.4] text-[#636366]">{note}</p>
      ) : null}

      <div className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] px-3 py-4">
        {medicineLine ? (
          <>
            {/* Health, not /health/medicines: her medicines now live in full
                on the Health page, so a second screen for them would be one
                more tap to reach the same list. */}
            <Link href="/health" prefetch className="flex w-full items-center gap-3">
              <IconCircle tone="brand">
                <Pill size={22} className="text-action-primary" aria-hidden />
              </IconCircle>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {/* rgba(0,0,0,0.8) over surface/default, resolved to a solid. */}
                <p className="text-[16px] leading-[1.2] text-[#333333]">{t.medicines.title}</p>
                <p className="text-text-primary text-[18px] leading-[1.2] font-medium">
                  {medicineLine}
                </p>
              </div>
              <ChevronRight size={20} className="text-text-tertiary shrink-0" aria-hidden />
            </Link>

            <div className="border-border-default border-t" />
          </>
        ) : null}

        <MeasurementRow
          href="/health/measurements/blood-pressure"
          tone="brand"
          icon={<HeartPulse size={22} className="text-action-primary" aria-hidden />}
          label={t.health.bloodPressure}
          value={bp ? `${bp.value}/${bp.valueSecondary}` : null}
          unit={bp?.unit ?? "mmHg"}
          when={bp ? relativeWhen(bp.measuredAt, locale) : null}
        />

        <div className="border-border-default border-t" />

        <MeasurementRow
          href="/health/measurements/blood-sugar"
          tone="error"
          icon={<Droplet size={22} className="text-feedback-error" aria-hidden />}
          label={t.health.bloodSugar}
          value={sugar ? String(sugar.value) : null}
          unit={sugar?.unit ?? "mg/dL"}
          when={sugar ? relativeWhen(sugar.measuredAt, locale) : null}
        />

        <div className="border-border-default border-t" />

        <MeasurementRow
          href="/health/measurements/weight"
          tone="success"
          icon={<Weight size={22} className="text-feedback-success-text" aria-hidden />}
          label={t.health.weight}
          value={weight ? String(weight.value) : null}
          unit={weight?.unit ?? "kg"}
          when={weight ? relativeWhen(weight.measuredAt, locale) : null}
        />
      </div>
    </section>
  );
}
