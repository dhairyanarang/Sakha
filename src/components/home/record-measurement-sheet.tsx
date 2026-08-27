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
  blood_sugar: { min: 40, max: 400, step: 1 },
  systolic: { min: 70, max: 220, step: 1 },
  diastolic: { min: 40, max: 140, step: 1 },
  // Half a kilo, because that is what a bathroom scale actually shows. The
  // ticks stay 10px apart, so the scale is simply twice as long to travel —
  // and the major marks still land on whole tens, keeping familiar landmarks.
  weight: { min: 30, max: 150, step: 0.5 },
};

const COPY = {
  blood_sugar: { title: "Record Sugar Reading", field: "Sugar Level (mg/dL)", unit: "mg/dL", saved: "Sugar level recorded." },
  blood_pressure: { title: "Record BP Reading", field: "", unit: "mmHg", saved: "Blood pressure recorded." },
  weight: { title: "Record Weight", field: "Weight (kg)", unit: "kg", saved: "Weight recorded." },
} as const;

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
  const copy = COPY[type];
  const unit = copy.unit;
  // Sugar and weight are both a single number on one scale; only the range,
  // the label and the starting point differ.
  const singleRange = isBp ? RANGE.blood_sugar : RANGE[type as "blood_sugar" | "weight"];

  const [single, setSingle] = useState(type === "weight" ? 65 : 120);
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
        value: isBp ? systolic : single,
        valueSecondary: isBp ? diastolic : null,
        unit,
        measuredAt: new Date(at).toISOString(),
      });
      if (err) setError(err);
      else {
        onSaved(copy.saved);
        onClose();
      }
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={copy.title}>
      <div className="flex flex-col gap-6">
        {/* Date & Time first, then the scale(s) — as drawn. */}
        <div className="flex w-full flex-col gap-2">
          <label className="text-subsection-heading text-text-secondary">Date &amp; Time</label>
          <div className="bg-surface-default border-border-default focus-within:border-action-primary relative flex h-[52px] items-center gap-3 rounded-md border p-4 transition-colors">
            <input
              type="datetime-local"
              value={at}
              onChange={(e) => setAt(e.target.value)}
              /* The browser draws its own picker button, which sat next to
                 ours and showed two calendars. Rather than delete one icon and
                 lose the other's tap target, the native one is stretched over
                 the whole field and made invisible: the Figma calendar is what
                 she sees, and a tap anywhere on the row opens the real picker
                 — a far bigger target than a 22px glyph for unsteady hands. */
              className="text-text-primary min-w-0 flex-1 text-[16px] leading-[1.2] font-medium outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
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
            <span className="text-subsection-heading text-text-secondary">{copy.field}</span>
            <RulerPicker
              label={copy.field}
              unit={unit}
              min={singleRange.min}
              max={singleRange.max}
              step={singleRange.step}
              value={single}
              onChange={setSingle}
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
