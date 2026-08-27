import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusTag } from "@/components/ui";
import { SLOT_LABEL } from "@/lib/today";
import type { MedicineSummary } from "@/lib/health-data";

/**
 * The Medicines summary at the top of Health.
 *
 * Each medicine carries one dot per time of day it is actually taken, filled
 * once confirmed today. A medicine taken only in the morning shows one dot,
 * not three with two hanging open — three dots would imply doses she never
 * had to take.
 *
 * The illustration is decorative and sits behind the list, so it is marked
 * aria-hidden and cannot swallow a tap.
 */
export function MedicinesCard({ medicines }: { medicines: MedicineSummary[] }) {
  const count = medicines.length;

  return (
    <Link
      href="/health/medicines"
      className="bg-surface-default border-border-soft relative flex w-full shrink-0 flex-col gap-6 overflow-hidden rounded-xl border-[0.5px] px-3 py-4"
    >
      <div className="flex items-center gap-2.5">
        <p className="text-text-primary flex-1 text-[18px] leading-[1.2] font-medium">
          Medicines
        </p>
        <ChevronRight size={20} className="text-text-primary shrink-0" aria-hidden />
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        {count === 0 ? (
          <p className="text-[14px] leading-[1.4] text-[#666666]">
            You have no medicines yet.
          </p>
        ) : (
          <>
            {/* rgba(0,0,0,0.6) over surface/default, resolved to a solid. */}
            <p className="text-[14px] leading-[1.2] text-[#666666]">
              {count} Active {count === 1 ? "Medicine" : "Medicines"}
            </p>
            {medicines.map((m) => (
              <div key={m.id} className="flex items-center gap-2.5">
                <p className="text-action-primary truncate text-[16px] leading-[1.4]">
                  {m.name}
                </p>
                <StatusTag
                  slots={m.slots.map((s) => s.confirmed)}
                  label={`${m.name}: ${m.slots
                    .map(
                      (s) =>
                        `${SLOT_LABEL[s.slot]} ${s.confirmed ? "confirmed" : "not confirmed"}`,
                    )
                    .join(", ")}`}
                />
              </div>
            ))}
          </>
        )}
      </div>

      {count > 0 ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/health/medicines.webp"
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-1 h-[90px] w-[136px] object-contain"
        />
      ) : null}
    </Link>
  );
}
