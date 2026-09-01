"use client";

import { useState, useTransition } from "react";
import { Check, Clock, Droplet, Footprints, HeartPulse, Pill } from "lucide-react";
import { CareRow } from "./care-row";
import { RowAction } from "./row-action";
import { RecordMeasurementSheet } from "./record-measurement-sheet";
import { LogWalkSheet } from "./log-walk-sheet";
import { EmptyState, SectionHeading, Toast } from "@/components/ui";
import { confirmDoses } from "@/app/actions/home";
import { currentSlot, slotHasStarted, slotLabel, slotTime } from "@/lib/today";
import { useI18n } from "@/lib/i18n/client";
import type { HomeData } from "@/lib/home-data";

export function TodaysCare({
  data,
  canEdit = true,
  medicinesHeading,
  medicinesAction,
}: {
  data: HomeData;
  /** A family member sees the same rows with nothing to press. */
  canEdit?: boolean;
  /**
   * Her own Home calls this section "Medicines" because it is the only one she
   * has. A family member is looking at a particular day, so theirs names the
   * day — "Today's Medicine", or the date when they have chosen one. Absent
   * here means her wording, unchanged.
   */
  medicinesHeading?: string;
  /** Sits opposite that heading. The family calendar, and nothing else. */
  medicinesAction?: React.ReactNode;
}) {
  const { t, locale } = useI18n();
  const [sheet, setSheet] = useState<null | "sugar" | "bp" | "walk">(null);
  // Every open remounts the sheet. Without this a second reading reused the
  // first one's date and time, which is a wrong reading, not just stale UI.
  const [sheetNonce, setSheetNonce] = useState(0);
  const openSheet = (which: "sugar" | "bp" | "walk") => {
    setSheetNonce((n) => n + 1);
    setSheet(which);
  };
  const [confirming, setConfirming] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function confirm(group: HomeData["doses"][number]) {
    setConfirming(group.slot);
    startTransition(async () => {
      await confirmDoses(group.medicationIds, group.slot);
      setConfirming(null);
      setToast(t.home.doseConfirmed(slotLabel(group.slot, locale)));
    });
  }

  const now = currentSlot();

  return (
    <>
      {/* Medicines are their own section now: three states live here that the
          care rows below do not have, and grouping them keeps the difference
          legible. */}
      <section className="flex shrink-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <SectionHeading>{medicinesHeading ?? t.medicines.title}</SectionHeading>
          {medicinesAction}
        </div>

        {data.doses.length === 0 ? (
          <EmptyState
            className="shrink-0"
            message={t.home.noMedicines}
            illustration={
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/empty/medicines-home.webp"
                alt=""
                aria-hidden
                className="h-[120px] w-[171px] object-contain"
              />
            }
          />
        ) : null}

        {data.doses.map((group) => {
          const done = group.status === "confirmed";
          const started = slotHasStarted(group.slot);
          // Lift only the one she is meant to be taking now, and only while it
          // is still open.
          const active = !done && started && group.slot === now;
          // "Gliptagrate M500 +1" rather than a list that truncates mid-name.
          const [first, ...rest] = group.medicineNames;
          const names =
            rest.length > 0 ? t.home.andMore(first, rest.length) : first;

          return (
            <CareRow
              key={group.slot}
              tone={active ? "brand-solid" : "brand"}
              highlight={active}
              icon={<Pill size={22} aria-hidden />}
              title={slotLabel(group.slot, locale)}
              action={
                !canEdit ? null : done ? (
                  <span className="text-feedback-success-text flex w-[100px] shrink-0 items-center justify-center gap-1 text-[16px]">
                    <Check size={18} aria-hidden />
                    {t.common.done}
                  </span>
                ) : !started ? (
                  /* Not yet. Stated plainly, with the time already on the row —
                     it is information, not a refusal. */
                  <span className="bg-surface-subtle text-text-tertiary flex w-[100px] shrink-0 items-center justify-center rounded-sm px-4 py-2.5 text-[16px] leading-[1.2]">
                    {t.home.upcoming}
                  </span>
                ) : (
                  <RowAction
                    onClick={() => confirm(group)}
                    disabled={confirming === group.slot}
                    aria-label={t.home.confirmDose(slotLabel(group.slot, locale))}
                  >
                    {confirming === group.slot ? t.common.saving : t.common.confirm}
                  </RowAction>
                )
              }
            >
              <p className="text-body-primary text-text-tertiary truncate">{names}</p>
              <span className="text-metadata text-text-tertiary flex items-center gap-1">
                <Clock size={16} aria-hidden />
                {slotTime(group.slot, locale)}
              </span>
            </CareRow>
          );
        })}
      </section>

      <section className="flex shrink-0 flex-col gap-3">
        <SectionHeading>
          {t.home.todaysCare}
        </SectionHeading>

      <CareRow
        tone="error"
        icon={<Droplet size={22} aria-hidden />}
        title={t.home.recordSugar}
        action={
          canEdit ? (
            <RowAction tone="tinted" onClick={() => openSheet("sugar")}>
              {t.common.record}
            </RowAction>
          ) : null
        }
      >
        <p className="text-metadata text-text-tertiary">
          {data.lastSugar
            ? t.home.lastReading(`${data.lastSugar.value} ${data.lastSugar.unit}`)
            : t.home.notRecordedYet}
        </p>
      </CareRow>

      <CareRow
        tone="brand"
        icon={<HeartPulse size={22} aria-hidden />}
        title={t.home.recordBp}
        action={
          canEdit ? (
            <RowAction tone="tinted" onClick={() => openSheet("bp")}>
              {t.common.record}
            </RowAction>
          ) : null
        }
      >
        <p className="text-metadata text-text-tertiary">
          {data.lastBp
            ? t.home.lastReading(
                `${data.lastBp.systolic}/${data.lastBp.diastolic} ${data.lastBp.unit}`,
              )
            : t.home.notRecordedYet}
        </p>
      </CareRow>

      <CareRow
        tone="success"
        icon={<Footprints size={22} aria-hidden />}
        title={t.home.walk}
        action={
          /* One walk entry per day, so once it exists the action edits it
             rather than adding another. Measurements are the opposite —
             several readings a day are normal — so those keep "Record". */
          canEdit ? (
            <RowAction tone="tinted" onClick={() => openSheet("walk")}>
              {data.walk === null ? t.home.logWalk : t.common.update}
            </RowAction>
          ) : null
        }
      >
        <p className="text-metadata text-text-tertiary">
          {data.walk === null
            ? t.home.notLogged
            : data.walk.didWalk
              ? data.walk.minutes
                ? t.home.minutesLogged(data.walk.minutes)
                : t.home.walkedToday
              : t.home.notToday}
        </p>
      </CareRow>

      <RecordMeasurementSheet
        key={`sugar-${sheetNonce}`}
        open={sheet === "sugar"}
        onClose={() => setSheet(null)}
        type="blood_sugar"
        onSaved={setToast}
      />
      <RecordMeasurementSheet
        key={`bp-${sheetNonce}`}
        open={sheet === "bp"}
        onClose={() => setSheet(null)}
        type="blood_pressure"
        onSaved={setToast}
      />
      <LogWalkSheet
        key={`walk-${sheetNonce}`}
        open={sheet === "walk"}
        onClose={() => setSheet(null)}
        onSaved={setToast}
        existing={data.walk}
      />

      </section>

      <Toast message={toast ?? ""} open={toast !== null} onDone={() => setToast(null)} />
    </>
  );
}
