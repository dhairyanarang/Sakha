"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/components/home/sheet";
import { Button, Chip, TextInput } from "@/components/ui";
import { createMedicine, updateMedicine } from "@/app/health/actions";
import type { MedicineDetail } from "@/lib/health-data";
import type { Enums } from "@/lib/supabase/types";

/**
 * Add and Edit Medicine — one sheet, because Figma draws them as the same
 * sheet with a different title and prefilled values.
 *
 * Same fields and same optionality as the onboarding step, deliberately: a
 * medicine added later must not ask for more than one added on day one.
 *
 * No delete. The design has no delete affordance on either frame, and the
 * schema's archived_at has no control anywhere — so removing a medicine is
 * still an undesigned flow rather than something invented here.
 */
const TIMES: { value: Enums<"time_of_day">; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

const CONDITIONS = ["Sugar", "BP", "Acidity", "Thyroid", "Asthma"];

export function MedicineSheet({
  open,
  onClose,
  onSaved,
  medicine,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  /** Absent means this is an add. */
  medicine?: MedicineDetail | null;
}) {
  const editing = Boolean(medicine);
  const preset = medicine?.conditionTag ?? "";

  const [name, setName] = useState(medicine?.name ?? "");
  const [times, setTimes] = useState<Enums<"time_of_day">[]>(
    medicine?.slots.map((s) => s.slot) ?? [],
  );
  // A saved condition that isn't one of the five suggestions is a custom one,
  // so the field opens already showing it rather than looking discarded.
  const [custom, setCustom] = useState(Boolean(preset) && !CONDITIONS.includes(preset));
  const [condition, setCondition] = useState(preset);
  const [remarks, setRemarks] = useState(medicine?.remarks ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleTime(v: Enums<"time_of_day">) {
    setTimes((cur) => (cur.includes(v) ? cur.filter((t) => t !== v) : [...cur, v]));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const input = {
        name,
        timesOfDay: times,
        conditionTag: condition || null,
        remarks: remarks || null,
      };
      const err = medicine
        ? await updateMedicine(medicine.id, input)
        : await createMedicine(input);
      if (err) setError(err);
      else {
        onSaved(editing ? "Medicine updated." : "Medicine added.");
        onClose();
      }
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={editing ? "Edit Medicine" : "Add Medicine"}>
      <div className="flex flex-col gap-6">
        <TextInput
          label="Medicine Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          /* Figma's placeholder here reads "e.g. Meeting Notes, Blog Post",
             which is copy from another product left in the frame. Using the
             onboarding step's placeholder instead — flagged. */
          placeholder="Gliptagrate M500"
          autoComplete="off"
        />

        <div className="flex flex-col gap-2.5">
          <FieldLabel>When do you take it?</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {TIMES.map((t) => (
              <Chip
                key={t.value}
                selected={times.includes(t.value)}
                onClick={() => toggleTime(t.value)}
              >
                {t.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <FieldLabel>What is the medicine for?</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <Chip
                key={c}
                selected={!custom && condition === c}
                onClick={() => {
                  setCustom(false);
                  setCondition(condition === c ? "" : c);
                }}
              >
                {c}
              </Chip>
            ))}
            {/* Not on this frame, but the IA lists Custom and onboarding
                builds it. Dropping it here would make a medicine addable at
                setup that cannot be edited the same way afterwards. */}
            <Chip
              selected={custom}
              onClick={() => {
                setCustom(!custom);
                setCondition("");
              }}
            >
              + Custom
            </Chip>
          </div>
          {custom ? (
            <TextInput
              label="Condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="Type a condition"
            />
          ) : null}
        </div>

        <TextInput
          label="Remarks (optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add Remarks"
        />

        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error">
            {error}
          </p>
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  /* rgba(0,0,0,0.6) over surface/default, resolved to a solid value. */
  return (
    <span className="text-[14px] leading-[1.2] font-medium text-[#636366]">{children}</span>
  );
}
