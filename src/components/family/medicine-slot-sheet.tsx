"use client";

import { useState } from "react";
import { ChevronRight, Pill } from "lucide-react";
import { IconCircle } from "@/components/ui";
import { Sheet } from "@/components/home/sheet";
import { DoseDots } from "@/components/health/dose-dots";
import { useI18n } from "@/lib/i18n/client";
import { slotLabel } from "@/lib/today";
import type { MedicinesBySlot } from "@/lib/family-data";

/**
 * What she takes at this time of day. Reading only.
 *
 * A family member is looking in, not looking after — there is nothing here to
 * confirm, edit or tick, and adding one would put two people in charge of the
 * same dose. The row shows the medicine and its three dots, which say when in
 * the day she takes it, so he can see how this tablet fits her routine rather
 * than only that it exists.
 *
 * The dots are the schedule, exactly as they are on her own Medicines screen —
 * filled where she takes it, empty where she does not. They are not a record
 * of what happened today; the slot's own status line above says that.
 */
export function MedicineSlotSheet({ group }: { group: MedicinesBySlot[number] }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);

  const confirmed = group.medicines.every((m) => m.status === "confirmed");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 text-left"
      >
        <IconCircle tone="brand">
          <Pill size={22} className="text-action-primary" aria-hidden />
        </IconCircle>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-text-primary text-[16px] leading-[1.2] font-medium">
            {t.time.slotMedicine[group.slot]}
          </span>
          {/* Confirmed reads in the success colour; everything else is simply
              quiet. Never an alarm colour — an unconfirmed dose is not a
              failure, and this screen must not imply that it is. */}
          <span
            className={
              "text-[16px] leading-[1.2] " +
              (confirmed ? "text-feedback-success-text" : "text-text-tertiary")
            }
          >
            {confirmed ? t.family.confirmed : t.family.unconfirmed}
          </span>
        </span>
        <ChevronRight size={20} className="text-text-tertiary shrink-0" aria-hidden />
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={slotLabel(group.slot, locale)}
      >
        <div className="flex flex-col gap-4">
          {group.medicines.map((m, i) => (
            <div key={m.id} className="flex flex-col gap-4">
              {i > 0 ? <div className="border-border-default border-t" /> : null}
              <div className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-text-primary text-[18px] leading-[1.3] font-medium">
                    {m.name}
                  </p>
                  {m.conditionTag ? (
                    <p className="text-text-secondary text-[14px] leading-[1.2]">
                      {m.conditionTag}
                    </p>
                  ) : null}
                </div>
                <DoseDots times={m.times} name={m.name} />
              </div>
            </div>
          ))}
        </div>
      </Sheet>
    </>
  );
}
