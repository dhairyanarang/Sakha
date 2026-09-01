import { Droplet, FileText, Footprints, HeartPulse, Pill, Weight } from "lucide-react";
import { IconCircle, SectionHeading } from "@/components/ui";
import { slotLabel } from "@/lib/today";
import { getT } from "@/lib/i18n/server";
import type { CareDay } from "@/lib/care-history";

/**
 * One past day, as it was.
 *
 * The same two cards today has — medicines, then care — but stated rather than
 * offered. A past day has nothing to press: no Confirm, no Record, no walk to
 * log. So the rows say what happened and stop, which is also why this cannot
 * simply reuse Today's Care.
 *
 * Medicines are one row per part of the day, never one per tablet. That is how
 * she confirms them and how the notification already describes them.
 *
 * Headings name the day being viewed. "Today's Medicine" above the first of
 * August would contradict the banner directly above it.
 */
export async function DayCare({
  day,
  date,
  calendar,
}: {
  day: CareDay;
  /** YYYY-MM-DD, for the headings. */
  date: string;
  /** The date picker, opposite the first heading, exactly as today has it. */
  calendar?: React.ReactNode;
}) {
  const { t, locale } = await getT();

  // Noon UTC so the label can never slip a day either side of the date string.
  const heading = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "long",
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

  const hasActivity =
    day.readings.length > 0 || day.walk !== null || day.documents.length > 0;

  return (
    <>
      <section className="flex shrink-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <SectionHeading>{heading}</SectionHeading>
          {calendar}
        </div>

        {day.doses.length === 0 ? (
          <div className="bg-surface-default border-border-soft rounded-xl border-[0.5px] px-4 py-5">
            <p className="text-body-medium text-text-secondary">
              {t.family.noMedicinesThatDay}
            </p>
          </div>
        ) : (
          <div className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] px-3 py-4">
            {day.doses.map((dose, i) => (
              <div key={dose.slot} className="flex flex-col gap-4">
                {i > 0 ? <div className="border-border-default border-t" /> : null}
                <div className="flex items-center gap-3">
                  <IconCircle tone="brand">
                    <Pill size={22} className="text-action-primary" aria-hidden />
                  </IconCircle>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p className="text-text-primary text-[16px] leading-[1.2] font-medium">
                      {slotLabel(dose.slot, locale)}
                    </p>
                    <p className="text-text-tertiary truncate text-[16px] leading-[1.2]">
                      {dose.medicineNames.join(", ")}
                    </p>
                  </div>
                  {/* Words, not colour. Confirmed, skipped, or simply not
                      answered — and the last of those is not a failure, so it
                      is stated as flatly as the others. */}
                  <p className="text-text-primary shrink-0 text-center text-[16px] leading-[1.2] font-medium">
                    {dose.status === "confirmed"
                      ? t.family.doseConfirmed
                      : dose.status === "skipped"
                        ? t.family.doseSkipped
                        : t.family.doseUnconfirmed}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex shrink-0 flex-col gap-3">
        <SectionHeading>{t.family.careThatDay}</SectionHeading>
        {!hasActivity ? (
          <div className="bg-surface-default border-border-soft rounded-xl border-[0.5px] px-4 py-5">
            <p className="text-body-medium text-text-secondary">
              {t.family.nothingElseThatDay}
            </p>
          </div>
        ) : (
          <div className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] px-3 py-4">
            {day.readings.map((r, i) => (
              <Row
                key={`r${i}`}
                first={i === 0}
                icon={
                  r.type === "weight" ? Weight : r.type === "blood_sugar" ? Droplet : HeartPulse
                }
                tone={r.type === "weight" ? "success" : r.type === "blood_sugar" ? "error" : "brand"}
                className={
                  r.type === "weight"
                    ? "text-feedback-success-text"
                    : r.type === "blood_sugar"
                      ? "text-feedback-error"
                      : "text-action-primary"
                }
                text={
                  r.type === "blood_pressure"
                    ? t.family.updates.bloodPressure(r.value, r.unit)
                    : r.type === "blood_sugar"
                      ? t.family.updates.bloodSugar(r.value, r.unit)
                      : t.family.updates.weight(r.value, r.unit)
                }
              />
            ))}
            {day.walk ? (
              <Row
                first={day.readings.length === 0}
                icon={Footprints}
                tone="success"
                className="text-feedback-success-text"
                text={
                  !day.walk.didWalk
                    ? t.family.updates.noWalk
                    : day.walk.minutes
                      ? t.family.updates.walked(day.walk.minutes)
                      : t.family.updates.wentForAWalk
                }
              />
            ) : null}
            {day.documents.map((title, i) => (
              <Row
                key={`d${i}`}
                first={false}
                icon={FileText}
                tone="neutral"
                className="text-text-secondary"
                text={t.family.updates.documentAdded(title)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/** One thing that happened, said in a line. Nothing to press. */
function Row({
  icon: Icon,
  tone,
  className,
  text,
  first,
}: {
  icon: typeof Droplet;
  tone: "brand" | "error" | "success" | "neutral";
  className: string;
  text: string;
  first: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {first ? null : <div className="border-border-default border-t" />}
      <div className="flex items-center gap-3">
        <IconCircle tone={tone}>
          <Icon size={22} className={className} aria-hidden />
        </IconCircle>
        <p className="text-text-primary min-w-0 flex-1 text-[16px] leading-[1.2] font-medium">
          {text}
        </p>
      </div>
    </div>
  );
}
