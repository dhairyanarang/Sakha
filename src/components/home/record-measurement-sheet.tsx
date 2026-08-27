"use client";

import { useState, useTransition } from "react";
import { Calendar } from "lucide-react";
import { Sheet } from "./sheet";
import { RulerPicker } from "./ruler-picker";
import { Button } from "@/components/ui";
import { recordMeasurement } from "@/app/actions/home";
import type { Enums } from "@/lib/supabase/types";

/** Local datetime string for a datetime-local input, in her timezone. */
function nowLocalInput() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

// Ranges wide enough to cover anything real, narrow enough that the scale
// stays usable. The picker can't produce a value outside them.
const RANGE = {
  blood_sugar: { min: 40, max: 400 },
  systolic: { min: 70, max: 220 },
  diastolic: { min: 40, max: 140 },
};

export function RecordMeasurementSheet({
  open,
  onClose,
  type,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  type: Enums<"measurement_type">;
  onSaved: (message: string) => void;
}) {
  const isBp = type === "blood_pressure";
  const unit = isBp ? "mmHg" : "mg/dL";

  const [sugar, setSugar] = useState(120);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [at, setAt] = useState(nowLocalInput);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const err = await recordMeasurement({
        type,
        value: isBp ? systolic : sugar,
        valueSecondary: isBp ? diastolic : null,
        unit,
        measuredAt: new Date(at).toISOString(),
      });
      if (err) setError(err);
      else {
        onSaved(isBp ? "Blood pressure recorded." : "Sugar level recorded.");
        onClose();
      }
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={isBp ? "Record BP Reading" : "Record Sugar Reading"}>
      <div className="flex flex-col gap-6">
        {/* Date & Time first, then the scale(s) — as drawn. */}
        <div className="flex w-full flex-col gap-2">
          <label className="text-subsection-heading text-text-secondary">Date &amp; Time</label>
          <div className="bg-surface-default border-border-default focus-within:border-action-primary flex h-[52px] items-center gap-3 rounded-md border p-4 transition-colors">
            <input
              type="datetime-local"
              value={at}
              onChange={(e) => setAt(e.target.value)}
              className="text-text-primary min-w-0 flex-1 text-[16px] leading-[1.2] font-medium outline-none"
            />
            <Calendar size={22} className="text-text-tertiary shrink-0" aria-hidden />
          </div>
        </div>

        {isBp ? (
          <>
            <div className="flex w-full flex-col gap-1">
              <span className="text-subsection-heading text-text-secondary">
                Systolic (Top Number)
              </span>
              <RulerPicker
                label="Systolic"
                unit={unit}
                min={RANGE.systolic.min}
                max={RANGE.systolic.max}
                value={systolic}
                onChange={setSystolic}
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <span className="text-subsection-heading text-text-secondary">
                Diastolic (Bottom Number)
              </span>
              <RulerPicker
                label="Diastolic"
                unit={unit}
                min={RANGE.diastolic.min}
                max={RANGE.diastolic.max}
                value={diastolic}
                onChange={setDiastolic}
              />
            </div>
          </>
        ) : (
          <div className="flex w-full flex-col gap-1">
            <span className="text-subsection-heading text-text-secondary">
              Sugar Level (mg/dL)
            </span>
            <RulerPicker
              label="Sugar level"
              unit="mg/dL"
              min={RANGE.blood_sugar.min}
              max={RANGE.blood_sugar.max}
              value={sugar}
              onChange={setSugar}
            />
          </div>
        )}

        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error">{error}</p>
        ) : null}
      </div>

      <div className="flex items-start gap-3">
        <Button variant="tertiary" onClick={onClose} disabled={pending} className="flex-1">
          Cancel
        </Button>
        <Button onClick={save} disabled={pending} className="flex-1">
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </Sheet>
  );
}
