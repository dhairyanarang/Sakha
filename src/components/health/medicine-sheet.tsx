"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/components/home/sheet";
import { Button, Chip, TextInput } from "@/components/ui";
import { archiveMedicine, createMedicine, updateMedicine } from "@/app/health/actions";
import type { MedicineDetail } from "@/lib/health-data";
import type { Enums } from "@/lib/supabase/types";
import { useI18n } from "@/lib/i18n/client";
import { slotName } from "@/lib/today";

/**
 * Add and Edit Medicine — one sheet, because Figma draws them as the same
 * sheet with a different title and prefilled values.
 *
 * Same fields and same optionality as the onboarding step, deliberately: a
 * medicine added later must not ask for more than one added on day one.
 *
 * Delete sits opposite the title on the edit variant, where the user asked for
 * it. It archives rather than deletes: every dose she ever confirmed points at
 * this medicine, and destroying that history to tidy a list is not a trade she
 * asked for.
 *
 * It confirms in place rather than opening a dialog over a dialog — one calm
 * question, with the safe answer first and the destructive one named plainly
 * rather than shouted at her.
 */
const TIMES: Enums<"time_of_day">[] = ["morning", "afternoon", "evening"];

/** The stored tag stays English; only its label is translated. */
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
    medicine?.times ?? [],
  );
  // A saved condition that isn't one of the five suggestions is a custom one,
  // so the field opens already showing it rather than looking discarded.
  const { t, locale } = useI18n();
  const CONDITION_LABEL: Record<string, string> = {
    Sugar: t.medicines.conditions.sugar,
    BP: t.medicines.conditions.bp,
    Acidity: t.medicines.conditions.acidity,
    Thyroid: t.medicines.conditions.thyroid,
    Asthma: t.medicines.conditions.asthma,
  };
  const [custom, setCustom] = useState(Boolean(preset) && !CONDITIONS.includes(preset));
  const [condition, setCondition] = useState(preset);
  const [remarks, setRemarks] = useState(medicine?.remarks ?? "");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!medicine) return;
    setError(null);
    startTransition(async () => {
      const err = await archiveMedicine(medicine.id);
      if (err) setError(err);
      else {
        onSaved(t.medicines.medicineRemoved);
        onClose();
      }
    });
  }

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
        onSaved(editing ? t.medicines.medicineUpdated : t.medicines.medicineAdded);
        onClose();
      }
    });
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? t.medicines.editMedicine : t.medicines.addMedicine}
      action={
        editing ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={pending}
            className="text-feedback-error -mr-2 flex h-[42px] items-center px-2 text-[16px] leading-[1.2] font-medium"
          >
            {t.common.delete}
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-6">
        <TextInput
          label={t.medicines.medicineNameLabel}
          value={name}
          onChange={(e) => setName(e.target.value)}
          /* Figma's placeholder here reads "e.g. Meeting Notes, Blog Post",
             which is copy from another product left in the frame. Using the
             onboarding step's placeholder instead — flagged. */
          placeholder={t.medicines.medicineNamePlaceholder}
          autoComplete="off"
        />

        <div className="flex flex-col gap-2.5">
          <FieldLabel>{t.medicines.whenDoYouTakeIt}</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {TIMES.map((slot) => (
              <Chip
                key={slot}
                selected={times.includes(slot)}
                onClick={() => toggleTime(slot)}
              >
                {slotName(slot, locale)}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <FieldLabel>{t.medicines.whatIsItFor}</FieldLabel>
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
                {CONDITION_LABEL[c] ?? c}
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
              {t.medicines.customChip}
            </Chip>
          </div>
          {custom ? (
            <TextInput
              label={t.medicines.conditionLabel}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder={t.medicines.conditionPlaceholder}
            />
          ) : null}
        </div>

        <TextInput
          label={t.medicines.remarksLabel}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder={t.medicines.remarksPlaceholder}
        />

        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error">
            {error}
          </p>
        ) : null}
      </div>

      {confirmingDelete ? (
        <div className="bg-feedback-error-surface flex flex-col gap-4 rounded-md p-4">
          <div className="flex flex-col gap-1">
            <p className="text-body-medium text-text-primary">{t.medicines.removeMedicineTitle}</p>
            <p className="text-body-secondary text-text-secondary">
              {t.medicines.removeMedicineBody}
            </p>
          </div>
          <div className="flex items-start gap-3">
            {/* The safe answer sits first and is the plainer of the two. */}
            <Button
              variant="tertiary"
              onClick={() => setConfirmingDelete(false)}
              disabled={pending}
              className="flex-1"
            >
              {t.common.keepIt}
            </Button>
            {/* Not a Button variant: the library has no destructive style, and
                inventing a fourth one for a single use is worse than one local
                button that says what it does. Flagged. */}
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="bg-feedback-error text-text-on-brand text-button-label flex h-[60px] flex-1 items-center justify-center rounded-xl transition-colors disabled:opacity-60"
            >
              {pending ? t.common.removing : t.common.remove}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <Button variant="tertiary" onClick={onClose} disabled={pending} className="flex-1">
            {t.common.cancel}
          </Button>
          <Button onClick={save} disabled={pending} className="flex-1">
            {pending ? t.common.saving : t.common.save}
          </Button>
        </div>
      )}
    </Sheet>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  /* rgba(0,0,0,0.6) over surface/default, resolved to a solid value. */
  return (
    <span className="text-[14px] leading-[1.2] font-medium text-[#636366]">{children}</span>
  );
}
