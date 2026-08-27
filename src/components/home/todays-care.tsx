"use client";

import { useState, useTransition } from "react";
import { Check, Clock, Droplet, Footprints, HeartPulse, Pill } from "lucide-react";
import { CareRow } from "./care-row";
import { RowAction } from "./row-action";
import { RecordMeasurementSheet } from "./record-measurement-sheet";
import { LogWalkSheet } from "./log-walk-sheet";
import { Toast } from "@/components/ui";
import { confirmDoses } from "@/app/actions/home";
import { currentSlot, SLOT_LABEL, SLOT_TIME, slotHasStarted } from "@/lib/today";
import type { HomeData } from "@/lib/home-data";

export function TodaysCare({ data }: { data: HomeData }) {
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
      setToast(`${SLOT_LABEL[group.slot]} confirmed.`);
    });
  }

  const now = currentSlot();

  return (
    <>
      {/* Medicines are their own section now: three states live here that the
          care rows below do not have, and grouping them keeps the difference
          legible. */}
      <section className="flex shrink-0 flex-col gap-3">
        <h2 className="text-subsection-heading text-action-primary uppercase tracking-[0.04em]">
          today’s medicine
        </h2>

        {data.doses.length === 0 ? (
          /* Home's empty state is deliberately calmer than the others: its job
             is today's status, not a first-time setup nudge. */
          <div className="bg-surface-default border-border-soft shrink-0 rounded-xl border-[0.5px] px-3 py-4">
            <p className="text-body-medium text-text-primary">You have no medicine recorded</p>
            <p className="text-body-secondary text-text-secondary mt-1">
              You can add your medicines from Health.
            </p>
          </div>
        ) : null}

        {data.doses.map((group) => {
          const done = group.status === "confirmed";
          const started = slotHasStarted(group.slot);
          // Lift only the one she is meant to be taking now, and only while it
          // is still open.
          const active = !done && started && group.slot === now;
          // "Gliptagrate M500 +1" rather than a list that truncates mid-name.
          const [first, ...rest] = group.medicineNames;
          const names = rest.length > 0 ? `${first} +${rest.length}` : first;

          return (
            <CareRow
              key={group.slot}
              tone={active ? "brand-solid" : "brand"}
              highlight={active}
              icon={<Pill size={22} aria-hidden />}
              title={SLOT_LABEL[group.slot]}
              action={
                done ? (
                  <span className="text-feedback-success-text flex w-[100px] shrink-0 items-center justify-center gap-1 text-[16px]">
                    <Check size={18} aria-hidden />
                    Done
                  </span>
                ) : !started ? (
                  /* Not yet. Stated plainly, with the time already on the row —
                     it is information, not a refusal. */
                  <span className="bg-surface-subtle text-text-tertiary flex w-[100px] shrink-0 items-center justify-center rounded-sm px-4 py-2.5 text-[16px] leading-[1.2]">
                    Upcoming
                  </span>
                ) : (
                  <RowAction
                    onClick={() => confirm(group)}
                    disabled={confirming === group.slot}
                    aria-label={`Confirm ${SLOT_LABEL[group.slot]}`}
                  >
                    {confirming === group.slot ? "Saving…" : "Confirm"}
                  </RowAction>
                )
              }
            >
              <p className="text-body-primary text-text-tertiary truncate">{names}</p>
              <span className="text-metadata text-text-tertiary flex items-center gap-1">
                <Clock size={16} aria-hidden />
                {SLOT_TIME[group.slot]}
              </span>
            </CareRow>
          );
        })}
      </section>

      <section className="flex shrink-0 flex-col gap-3">
        <h2 className="text-subsection-heading text-action-primary uppercase tracking-[0.04em]">
          today’s care
        </h2>

      <CareRow
        tone="error"
        icon={<Droplet size={22} aria-hidden />}
        title="Record Sugar level"
        action={
          <RowAction tone="tinted" onClick={() => openSheet("sugar")}>
            Record
          </RowAction>
        }
      >
        <p className="text-metadata text-text-tertiary">
          {data.lastSugar ? `Last: ${data.lastSugar.value} ${data.lastSugar.unit}` : "No readings yet"}
        </p>
      </CareRow>

      <CareRow
        tone="brand"
        icon={<HeartPulse size={22} aria-hidden />}
        title="Record BP"
        action={
          <RowAction tone="tinted" onClick={() => openSheet("bp")}>
            Record
          </RowAction>
        }
      >
        <p className="text-metadata text-text-tertiary">
          {data.lastBp
            ? `Last: ${data.lastBp.systolic}/${data.lastBp.diastolic} ${data.lastBp.unit}`
            : "No readings yet"}
        </p>
      </CareRow>

      <CareRow
        tone="success"
        icon={<Footprints size={22} aria-hidden />}
        title="Walk"
        action={
          /* One walk entry per day, so once it exists the action edits it
             rather than adding another. Measurements are the opposite —
             several readings a day are normal — so those keep "Record". */
          <RowAction tone="tinted" onClick={() => openSheet("walk")}>
            {data.walk === null ? "Log Walk" : "Update"}
          </RowAction>
        }
      >
        <p className="text-metadata text-text-tertiary">
          {data.walk === null
            ? "Not Logged"
            : data.walk.didWalk
              ? data.walk.minutes
                ? `${data.walk.minutes} minutes`
                : "Walked today"
              : "Not today"}
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
