import { Check, Clock, Pill } from "lucide-react";
import { IconCircle, SectionHeading } from "@/components/ui";
import { DoseDots } from "@/components/health/dose-dots";
import { slotName, slotTime } from "@/lib/today";
import { getT } from "@/lib/i18n/server";
import { conditionLabel } from "@/lib/i18n/labels";
import type { MedicinesBySlot } from "@/lib/family-data";

/**
 * What Mum takes, and whether she has taken it.
 *
 * Grouped morning / afternoon / evening because that is how her own Home is
 * grouped and how she would describe it out loud — not one flat list sorted by
 * name. A medicine taken twice a day appears under both times; that is not a
 * duplicate, it is two doses.
 *
 * Nothing here is tappable. The son is reading, and the row carries no
 * affordance suggesting otherwise — no edit pencil, no chevron to a screen
 * with one on it. Her medicines are hers to change.
 *
 * The status wording never blames. A dose that has not come around yet says
 * "Not yet" rather than sitting there unanswered, and one she chose not to
 * take says "Skipped" — never "missed" or "late", which is a hard rule through
 * the whole product.
 */
export async function FamilyMedicines({ groups }: { groups: MedicinesBySlot }) {
  const { t, locale } = await getT();

  if (groups.length === 0) {
    return (
      <section className="flex shrink-0 flex-col gap-2.5">
        <SectionHeading>{t.medicines.title}</SectionHeading>
        <div className="bg-surface-default border-border-soft rounded-xl border-[0.5px] px-4 py-5">
          <p className="text-body-medium text-text-secondary">
            {t.family.noMedicinesAdded}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex shrink-0 flex-col gap-3">
      <SectionHeading>{t.medicines.title}</SectionHeading>

      {groups.map((group) => (
        <div key={group.slot} className="flex shrink-0 flex-col gap-2">
          {/* The time of day, with the hour beside it so "Morning" is a time
              and not a mood. Same table the owner's Home reads from. */}
          <div className="flex items-center gap-2 px-1">
            <p className="text-text-primary text-[16px] leading-[1.2] font-medium">
              {slotName(group.slot, locale)}
            </p>
            <span className="text-text-tertiary flex items-center gap-1 text-[14px] leading-[1.2]">
              <Clock size={14} aria-hidden />
              {slotTime(group.slot, locale)}
            </span>
          </div>

          <div className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] px-3 py-4">
            {group.medicines.map((m, i) => (
              <div key={`${m.id}-${group.slot}`} className="flex flex-col gap-4">
                {i > 0 ? <div className="border-border-default ml-[56px] border-t" /> : null}

                <div className="flex items-center gap-3">
                  <IconCircle tone="brand">
                    <Pill size={22} className="text-action-primary" aria-hidden />
                  </IconCircle>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p className="text-body-medium text-text-primary truncate">{m.name}</p>
                    {m.conditionTag ? (
                      /* rgba(0,0,0,0.4) over surface/default, as a solid. */
                      <p className="truncate text-[14px] leading-[1.2] text-[#999999]">
                        {conditionLabel(m.conditionTag, t)}
                      </p>
                    ) : null}
                    {/* The three dots, so a medicine taken at more than one
                        time says so on every row it appears in. */}
                    <DoseDots times={m.times} name={m.name} />
                  </div>

                  <DoseStatus
                    status={m.status}
                    started={m.started}
                    labels={{
                      taken: t.medicines.taken,
                      skipped: t.medicines.skipped,
                      notYet: t.medicines.notYet,
                      unconfirmed: t.medicines.unconfirmed,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

/**
 * Never colour alone: each state carries its own word, and the one that is
 * genuinely good carries a tick as well.
 */
function DoseStatus({
  status,
  started,
  labels,
}: {
  status: "confirmed" | "skipped" | "unconfirmed";
  started: boolean;
  labels: { taken: string; skipped: string; notYet: string; unconfirmed: string };
}) {
  if (status === "confirmed") {
    return (
      <span className="text-feedback-success-text flex shrink-0 items-center gap-1 text-[14px] leading-[1.2] font-medium">
        <Check size={16} aria-hidden />
        {labels.taken}
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span className="text-text-tertiary shrink-0 text-[14px] leading-[1.2]">
        {labels.skipped}
      </span>
    );
  }
  // Not yet due is a fact about the clock, not an outstanding dose.
  return (
    <span className="text-text-tertiary shrink-0 text-[14px] leading-[1.2]">
      {started ? labels.unconfirmed : labels.notYet}
    </span>
  );
}
