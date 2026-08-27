"use client";

import { useState, useTransition } from "react";
import { Calendar } from "lucide-react";
import { Sheet } from "./sheet";
import { Button } from "@/components/ui";
import { recordMeasurement } from "@/app/actions/home";
import type { Enums } from "@/lib/supabase/types";

/** A field with a unit suffix, as drawn on the Record sheets. */
function ValueField({
  label,
  unit,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label className="text-subsection-heading text-text-secondary">{label}</label>
      <div className="bg-surface-default border-border-default focus-within:border-action-primary flex items-center gap-3 rounded-md border p-4 transition-colors">
        <input
          // Numeric keypad, not a full keyboard — fewer wrong taps.
          inputMode="decimal"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
          className="text-text-primary min-w-0 flex-1 text-[18px] leading-[1.2] font-medium outline-none"
        />
        <span className="text-metadata text-text-tertiary shrink-0">{unit}</span>
      </div>
    </div>
  );
}

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

export function RecordMeasurementSheet({
  open,
  onClose,
  type,
}: {
  open: boolean;
  onClose: () => void;
  type: Enums<"measurement_type">;
}) {
  const isBp = type === "blood_pressure";
  const unit = isBp ? "mmHg" : "mg/dL";

  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [at, setAt] = useState(nowLocalInput);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const err = await recordMeasurement({
        type,
        value: Number(primary),
        valueSecondary: isBp ? Number(secondary) : null,
        unit,
        measuredAt: new Date(at).toISOString(),
      });
      if (err) setError(err);
      else {
        setPrimary("");
        setSecondary("");
        onClose();
      }
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={isBp ? "Record BP Reading" : "Record Sugar Reading"}>
      <div className="flex flex-col gap-6">
        <ValueField
          label={isBp ? "Systolic (Top Number)" : "Sugar Level (mg/dL)"}
          unit={unit}
          value={primary}
          onChange={setPrimary}
          autoFocus
        />
        {isBp ? (
          <ValueField
            label="Diastolic (Bottom Number)"
            unit={unit}
            value={secondary}
            onChange={setSecondary}
          />
        ) : null}

        <div className="flex w-full flex-col gap-2">
          <label className="text-subsection-heading text-text-secondary">Date &amp; Time</label>
          {/* Native picker rather than a custom one: it's the control she
              already knows from her phone, and needs no extra library. */}
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
