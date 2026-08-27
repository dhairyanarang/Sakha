"use client";

import { useState, useTransition } from "react";
import { Calendar } from "lucide-react";
import { Sheet } from "./sheet";
import { RulerPicker } from "./ruler-picker";
import { Button } from "@/components/ui";
import {
  deleteMeasurement,
  recordMeasurement,
  updateMeasurement,
} from "@/app/actions/home";
import type { MeasurementEntry } from "@/lib/health-data";
import type { Enums } from "@/lib/supabase/types";

/**
 * Records a reading, and edits or removes one already taken.
 *
 * Editing reuses this form rather than getting its own: the fields are the
 * same, the ruler is the same, and one thing to learn is better than two.
 * Delete sits opposite the title where it does on Edit Medicine, so removing
 * something is the same move everywhere in the app.
 */

/** Local datetime string for a datetime-local input, in her timezone. */
function toLocalInput(iso?: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(iso ? new Date(iso) : new Date());
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
  entry,
}: {
  open: boolean;
  onClose: () => void;
  type: Enums<"measurement_type">;
  onSaved: (message: string) => void;
  /** Absent means a new reading. Present means correcting that one. */
  entry?: MeasurementEntry | null;
}) {
  const isBp = type === "blood_pressure";
  const copy = COPY[type];
  const unit = copy.unit;
  const editing = Boolean(entry);
  // Sugar and weight are both a single number on one scale; only the range,
  // the label and the starting point differ.
  const singleRange = isBp ? RANGE.blood_sugar : RANGE[type as "blood_sugar" | "weight"];

  const [single, setSingle] = useState(
    entry ? entry.value : type === "weight" ? 65 : 120,
  );
  const [systolic, setSystolic] = useState(entry ? entry.value : 120);
  const [diastolic, setDiastolic] = useState(entry?.valueSecondary ?? 80);
  const [at, setAt] = useState(() => toLocalInput(entry?.measuredAt));
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const input = {
        type,
        value: isBp ? systolic : single,
        valueSecondary: isBp ? diastolic : null,
        unit,
        measuredAt: new Date(at).toISOString(),
      };
      const err = entry
        ? await updateMeasurement(entry.id, input)
        : await recordMeasurement(input);
      if (err) setError(err);
      else {
        onSaved(editing ? "Reading updated." : copy.saved);
        onClose();
      }
    });
  }

  function remove() {
    if (!entry) return;
    setError(null);
    startTransition(async () => {
      const err = await deleteMeasurement(entry.id);
      if (err) setError(err);
      else {
        onSaved("Reading removed.");
        onClose();
      }
    });
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? "Edit reading" : copy.title}
      action={
        editing ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={pending}
            className="text-feedback-error -mr-2 flex h-[42px] items-center px-2 text-[16px] leading-[1.2] font-medium"
          >
            Delete
          </button>
        ) : undefined
      }
    >
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

      {confirmingDelete ? (
        <div className="bg-feedback-error-surface flex flex-col gap-4 rounded-md p-4">
          <div className="flex flex-col gap-1">
            <p className="text-body-medium text-text-primary">Remove this reading?</p>
            <p className="text-body-secondary text-text-secondary">
              It comes off your history. Your other readings stay as they are.
            </p>
          </div>
          <div className="flex items-start gap-3">
            {/* The safe answer first, and the plainer of the two. */}
            <Button
              variant="tertiary"
              onClick={() => setConfirmingDelete(false)}
              disabled={pending}
              className="flex-1"
            >
              Keep it
            </Button>
            {/* Not a Button variant: the library has no destructive style, and
                one local button that says what it does beats inventing a
                fourth variant for two uses. Same treatment as Edit Medicine. */}
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="bg-feedback-error text-text-on-brand text-button-label flex h-[60px] flex-1 items-center justify-center rounded-xl transition-colors disabled:opacity-60"
            >
              {pending ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <Button variant="tertiary" onClick={onClose} disabled={pending} className="flex-1">
            Cancel
          </Button>
          <Button onClick={save} disabled={pending} className="flex-1">
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
