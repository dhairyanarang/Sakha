"use client";

import { useState, useTransition } from "react";
import { Check, Clock, Droplet, Footprints, HeartPulse, Pill } from "lucide-react";
import { CareRow } from "./care-row";
import { RowAction } from "./row-action";
import { RecordMeasurementSheet } from "./record-measurement-sheet";
import { LogWalkSheet } from "./log-walk-sheet";
import { Toast } from "@/components/ui";
import { confirmDoses } from "@/app/actions/home";
import { SLOT_LABEL, SLOT_TIME } from "@/lib/today";
import type { HomeData } from "@/lib/home-data";

export function TodaysCare({ data }: { data: HomeData }) {
  const [sheet, setSheet] = useState<null | "sugar" | "bp" | "walk">(null);
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

  return (
    <section className="flex shrink-0 flex-col gap-3">
      <h2 className="text-subsection-heading text-action-primary uppercase tracking-[0.04em]">
        today’s care
      </h2>

      {data.doses.length === 0 ? (
        /* Home's empty state is deliberately calmer than the others: its job is
           today's status, not a first-time setup nudge. */
        <div className="bg-surface-default border-border-soft shrink-0 rounded-xl border-[0.5px] px-3 py-4">
          <p className="text-body-medium text-text-primary">You have no medicine recorded</p>
          <p className="text-body-secondary text-text-secondary mt-1">
            You can add your medicines from Health.
          </p>
        </div>
      ) : null}

      {data.doses.map((group) => {
        const done = group.status === "confirmed";
        return (
          <CareRow
            key={group.slot}
            tone="brand-solid"
            icon={<Pill size={22} aria-hidden />}
            title={SLOT_LABEL[group.slot]}
            action={
              done ? (
                <span className="text-feedback-success-text flex w-[100px] shrink-0 items-center justify-center gap-1 text-[16px]">
                  <Check size={18} aria-hidden />
                  Done
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
            <p className="text-body-primary text-action-primary truncate">
              {group.medicineNames.join(", ")}
            </p>
            <span className="text-metadata text-text-tertiary flex items-center gap-1">
              <Clock size={16} aria-hidden />
              {SLOT_TIME[group.slot]}
            </span>
          </CareRow>
        );
      })}

      <CareRow
        tone="error"
        icon={<Droplet size={22} aria-hidden />}
        title="Record Sugar level"
        action={
          <RowAction tone="tinted" onClick={() => setSheet("sugar")}>
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
          <RowAction tone="tinted" onClick={() => setSheet("bp")}>
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
          <RowAction tone="tinted" onClick={() => setSheet("walk")}>
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
        open={sheet === "sugar"}
        onClose={() => setSheet(null)}
        type="blood_sugar"
        onSaved={setToast}
      />
      <RecordMeasurementSheet
        open={sheet === "bp"}
        onClose={() => setSheet(null)}
        type="blood_pressure"
        onSaved={setToast}
      />
      <LogWalkSheet
        open={sheet === "walk"}
        onClose={() => setSheet(null)}
        onSaved={setToast}
        existing={data.walk}
      />

      <Toast message={toast ?? ""} open={toast !== null} onDone={() => setToast(null)} />
    </section>
  );
}
