"use client";

import { PenLine, Pill } from "lucide-react";
import { IconCircle, StatusTag } from "@/components/ui";
import { SLOT_LABEL } from "@/lib/today";
import type { MedicineDetail } from "@/lib/health-data";

/**
 * One medicine in the Medicines list: name, her own remark, today's doses,
 * and a way in to edit it.
 *
 * The dots are per slot and read morning to evening. An outlined dot means
 * not yet confirmed — never "missed", which is not a state this product has.
 *
 * Only the Edit button is interactive, not the whole row. Editing opens a
 * sheet over this screen, as drawn, so a card that also swallowed taps would
 * make the explicit button pointless and give the same action two targets.
 */
export function MedicineRow({
  medicine,
  onEdit,
}: {
  medicine: MedicineDetail;
  onEdit: () => void;
}) {
  const doses = medicine.slots
    .map((s) => `${SLOT_LABEL[s.slot]} ${s.confirmed ? "confirmed" : "not confirmed"}`)
    .join(", ");

  return (
    <div className="bg-surface-default border-border-soft flex w-full items-center gap-3 rounded-xl border-[0.5px] px-3 py-4">
      <IconCircle tone="brand">
        <Pill size={22} className="text-action-primary" aria-hidden />
      </IconCircle>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-body-medium text-text-primary truncate">{medicine.name}</p>
          {medicine.remarks ? (
            /* rgba(0,0,0,0.4) over surface/default, resolved to a solid value. */
            <p className="truncate text-[14px] leading-[1.2] text-[#999999]">
              {medicine.remarks}
            </p>
          ) : null}
        </div>
        <StatusTag
          slots={medicine.slots.map((s) => s.confirmed)}
          label={`${medicine.name}: ${doses}`}
        />
      </div>

      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${medicine.name}`}
        className="bg-surface-tinted text-action-primary active:text-action-primary-pressed flex shrink-0 items-center gap-2 rounded-sm px-3 py-2 text-[16px] leading-[1.2] transition-colors"
      >
        <PenLine size={18} aria-hidden />
        Edit
      </button>
    </div>
  );
}
