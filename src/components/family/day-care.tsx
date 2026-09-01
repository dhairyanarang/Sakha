import { Droplet, FileText, Footprints, HeartPulse, Pill, Weight } from "lucide-react";
import { IconCircle, SectionHeading, StatusTag } from "@/components/ui";
import { SLOT_ORDER, slotName } from "@/lib/today";
import { getT } from "@/lib/i18n/server";
import type { CareDay } from "@/lib/care-history";
import type { DotState } from "@/components/ui/status-tag";

/**
 * One past day, as it was.
 *
 * The rolling feed answers "what has been going on lately" and is right for
 * today. A chosen date asks something narrower — "how did that day go" — so
 * this shows that day and only that day, with no window and nothing from
 * either side of it to confuse what is being looked at.
 *
 * Medicines are one row per part of the day, never one per tablet. That is how
 * she confirms them (a single button per slot) and how the notification
 * already describes them, and it is the difference between three rows and nine
 * on an ordinary Tuesday.
 *
 * Readings, the walk and documents keep their own rows underneath. They are
 * the reason a family member opened the app on a day something happened, and
 * the medicines must never be able to push them off the screen.
 */
export async function DayCare({ day }: { day: CareDay }) {
  const { t, locale } = await getT();

  const byStatus = new Map(day.doses.map((d) => [d.slot, d.status]));

  /**
   * The day in three dots, reading morning, afternoon, evening.
   *
   * Solid where the slot was confirmed, a ring where medicines were due and it
   * was not, and faint where nothing was due then — which is the state that
   * would otherwise have collided with "not confirmed" and made one mark mean
   * two things.
   */
  const dots: DotState[] = SLOT_ORDER.map((slot) => {
    const status = byStatus.get(slot);
    if (!status) return "n/a";
    return status === "confirmed" ? "yes" : "no";
  });

  const summary = SLOT_ORDER.map((slot) => {
    const status = byStatus.get(slot);
    if (!status) return `${slotName(slot, locale)}: ${t.family.nothingDue}`;
    return `${slotName(slot, locale)}: ${
      status === "confirmed"
        ? t.family.doseConfirmed
        : status === "skipped"
          ? t.family.doseSkipped
          : t.family.doseUnconfirmed
    }`;
  }).join(", ");

  const hasActivity =
    day.readings.length > 0 || day.walk !== null || day.documents.length > 0;

  return (
    <>
      <section className="flex shrink-0 flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <SectionHeading>{t.family.medicinesThatDay}</SectionHeading>
          {day.doses.length > 0 ? <StatusTag states={dots} label={summary} /> : null}
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
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-body-medium text-text-primary">
                      {slotName(dose.slot, locale)}
                    </p>
                    <p className="text-text-secondary truncate text-[14px] leading-[1.2]">
                      {dose.medicineNames.join(", ")}
                    </p>
                  </div>
                  {/* Words as well as dots — a status must never depend on
                      telling two small shapes apart. */}
                  <p
                    className={
                      "shrink-0 text-[15px] leading-[1.3] " +
                      (dose.status === "confirmed"
                        ? "text-text-primary font-medium"
                        : "text-text-secondary")
                    }
                  >
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

      <section className="flex shrink-0 flex-col gap-2.5">
        <SectionHeading>{t.family.alsoThatDay}</SectionHeading>
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
                icon={r.type === "weight" ? Weight : r.type === "blood_sugar" ? Droplet : HeartPulse}
                tone={r.type === "weight" ? "success" : r.type === "blood_sugar" ? "error" : "brand"}
                className={
                  r.type === "weight"
                    ? "text-feedback-success-text"
                    : r.type === "blood_sugar"
                      ? "text-feedback-error"
                      : "text-action-primary"
                }
                first={i === 0}
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
                icon={Footprints}
                tone="success"
                className="text-feedback-success-text"
                first={day.readings.length === 0}
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
                icon={FileText}
                tone="neutral"
                className="text-text-secondary"
                first={false}
                text={t.family.updates.documentAdded(title)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/** The same row shape Recent Updates uses, so a day reads like the feed does. */
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
        <p className="text-body-medium text-text-primary min-w-0 flex-1">{text}</p>
      </div>
    </div>
  );
}
