import { Droplet, FileText, Footprints, HeartPulse, Pill, Weight } from "lucide-react";
import { IconCircle, SectionHeading } from "@/components/ui";
import { relativeWhen, slotName } from "@/lib/today";
import { getT } from "@/lib/i18n/server";
import type { RecentUpdate, UpdateKind } from "@/lib/family-data";
import type { Messages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

/**
 * Recent Updates — the answer to "how is she doing", in one glance.
 *
 * This is the first thing a family member sees and the reason they opened the
 * app, so it leads. It is a record of what has happened on her account, newest
 * first, and it is deliberately DESCRIPTIVE: a reading is a number and a time,
 * never a verdict. Nothing here is coloured by whether a value is high or low,
 * because this product does not manufacture alarm and a son reading "128/82"
 * in red at eleven at night helps nobody.
 *
 * The same rule holds for medicines. A dose is confirmed or it is skipped —
 * never missed, never failed — and a skipped dose is stated as flatly as a
 * confirmed one.
 */
const ICON: Record<UpdateKind, { Icon: typeof Droplet; tone: "brand" | "error" | "success" | "neutral"; className: string }> = {
  blood_pressure: { Icon: HeartPulse, tone: "brand", className: "text-action-primary" },
  blood_sugar: { Icon: Droplet, tone: "error", className: "text-feedback-error" },
  weight: { Icon: Weight, tone: "success", className: "text-feedback-success-text" },
  medicine: { Icon: Pill, tone: "brand", className: "text-action-primary" },
  document: { Icon: FileText, tone: "neutral", className: "text-text-secondary" },
  walk: { Icon: Footprints, tone: "success", className: "text-feedback-success-text" },
};

/** What the row says, assembled per language rather than concatenated here. */
function title(update: RecentUpdate, t: Messages, locale: Locale): string {
  const u = t.family.updates;
  switch (update.kind) {
    case "blood_pressure":
      return u.bloodPressure(update.value ?? "", update.unit ?? "");
    case "blood_sugar":
      return u.bloodSugar(update.value ?? "", update.unit ?? "");
    case "weight":
      return u.weight(update.value ?? "", update.unit ?? "");
    case "medicine": {
      const when = update.slot ? slotName(update.slot, locale) : "";
      return update.status === "confirmed"
        ? u.medicineConfirmed(when)
        : u.medicineSkipped(when);
    }
    case "document":
      return u.documentAdded(update.detail ?? "");
    case "walk":
      if (update.status !== "confirmed") return u.noWalk;
      return update.detail ? u.walked(Number(update.detail)) : u.wentForAWalk;
  }
}

export async function RecentUpdates({ updates }: { updates: RecentUpdate[] }) {
  const { t, locale } = await getT();

  return (
    <section className="flex shrink-0 flex-col gap-2.5">
      <SectionHeading>{t.family.recentUpdates}</SectionHeading>

      {updates.length === 0 ? (
        <div className="bg-surface-default border-border-soft flex flex-col gap-1 rounded-xl border-[0.5px] px-4 py-5">
          <p className="text-body-medium text-text-primary">{t.family.nothingRecent}</p>
          <p className="text-body-secondary text-text-secondary">
            {t.family.nothingRecentBody}
          </p>
        </div>
      ) : (
        <div className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] px-3 py-4">
          {updates.map((update, i) => {
            const { Icon, tone, className } = ICON[update.kind];
            return (
              <div key={update.id} className="flex flex-col gap-4">
                {i > 0 ? <div className="border-border-default border-t" /> : null}
                <div className="flex items-center gap-3">
                  <IconCircle tone={tone}>
                    <Icon size={22} className={className} aria-hidden />
                  </IconCircle>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-body-medium text-text-primary">
                      {title(update, t, locale)}
                    </p>
                    <p className="flex min-w-0 items-center gap-1.5">
                      {/* The medicine's own name, when there is one — a son
                          checking in wants to know which tablet, not just that
                          something was confirmed. */}
                      {update.kind === "medicine" && update.detail ? (
                        <>
                          <span className="text-text-secondary truncate text-[14px] leading-[1.2]">
                            {update.detail}
                          </span>
                          <span aria-hidden className="text-[#999999]">
                            ·
                          </span>
                        </>
                      ) : null}
                      {/* rgba(0,0,0,0.4) over surface/default, as a solid. */}
                      <span className="shrink-0 text-[14px] leading-[1.2] text-[#999999]">
                        {relativeWhen(update.at, locale)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
