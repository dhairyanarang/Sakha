import { Droplet, HeartPulse, Weight } from "lucide-react";
import { SectionHeading } from "@/components/ui";
import { AppHeader } from "@/components/app-header";
import { MeasurementRow } from "@/components/health/measurement-row";
import { DocumentsSection } from "@/components/health/documents-section";
import { getMedicinesBySlot } from "@/lib/family-data";
import { getHealthOverview, getMeasurementsOn } from "@/lib/health-data";
import { getHeaderAvatar } from "@/lib/profile-data";
import { localDate, readingStamp } from "@/lib/today";
import { getT } from "@/lib/i18n/server";
import { FamilyDateBar } from "./family-date-bar";
import { MedicineSlotSheet } from "./medicine-slot-sheet";

/**
 * Family View — one screen, one day.
 *
 * Everything a family member came to know is here: what she was meant to take
 * and whether it was confirmed, what was measured, and the documents. There is
 * no bottom nav and no second tab, because there is nothing else to go to; the
 * avatar in the header is still the way to Profile and to switching account.
 *
 * The date at the top governs the two things that belong to a day. Documents
 * do not move with it — a prescription is not an event that happened on the
 * Tuesday somebody photographed it, and filtering the library by date would
 * hide her records on most days of the year.
 *
 * Nothing on this screen writes to a dose. He can add a reading and add a
 * document, which the product already allows him; medicines are hers to
 * confirm.
 */
export async function FamilyHome({
  accountId,
  ownerName,
  canEdit,
  date,
}: {
  accountId: string;
  ownerName: string;
  /** Contributors may record and upload; view-only members may not. */
  canEdit: boolean;
  /** The day being shown. Null means today. */
  date?: string | null;
}) {
  const { t, locale } = await getT();

  const today = localDate();
  const shown = date ?? today;
  const isToday = shown === today;

  const [slots, onDay, overview, avatarUrl] = await Promise.all([
    getMedicinesBySlot(accountId, shown),
    getMeasurementsOn(accountId, shown),
    // Documents only. The latest readings it also returns are deliberately
    // unused here — this screen shows the chosen day's or nothing at all.
    getHealthOverview(accountId),
    getHeaderAvatar(),
  ]);

  const sugar = onDay.blood_sugar;
  const bp = onDay.blood_pressure;
  const weight = onDay.weight;

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <AppHeader avatarUrl={avatarUrl}>
        <p className="text-text-primary truncate text-[20px] leading-[1.2] font-medium">
          {t.family.theirSakha(ownerName)}
        </p>
        <p className="mt-1 text-[14px] leading-[1.2] text-[#636366]">
          {t.family.headerSubtitle}
        </p>
      </AppHeader>

      <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-4">
        <FamilyDateBar date={shown} isToday={isToday} />

        <section className="flex shrink-0 flex-col gap-3">
          <SectionHeading>
            {isToday ? t.family.todaysMedicine : t.family.medicinesHeading}
          </SectionHeading>

          {slots.length === 0 ? (
            <div className="bg-surface-default border-border-soft rounded-xl border-[0.5px] px-4 py-5">
              <p className="text-body-medium text-text-secondary">
                {t.family.noMedicinesThatDay}
              </p>
            </div>
          ) : (
            <div className="bg-surface-default border-border-soft flex flex-col gap-[18px] rounded-xl border-[0.5px] px-3 py-[18px]">
              {slots.map((group, i) => (
                <div key={group.slot} className="flex flex-col gap-[18px]">
                  {i > 0 ? <div className="border-border-default border-t" /> : null}
                  <MedicineSlotSheet group={group} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="flex shrink-0 flex-col gap-2.5">
          <SectionHeading>{t.family.measurements}</SectionHeading>
          <div className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] px-3 py-4">
            {/* A reading is shown only if it was taken on this day. Never the
                latest from another — a June blood pressure under Saturday the
                2nd would be a false statement about her. */}
            <MeasurementRow
              href="/health/measurements/blood-sugar"
              icon={<Droplet size={22} className="text-feedback-error" aria-hidden />}
              tone="error"
              label={t.health.bloodSugar}
              value={sugar ? String(sugar.value) : null}
              unit="mg/dL"
              when={sugar ? readingStamp(sugar.measuredAt, locale) : null}
            />
            <div className="border-border-default border-t" />
            <MeasurementRow
              href="/health/measurements/blood-pressure"
              icon={<HeartPulse size={22} className="text-action-primary" aria-hidden />}
              tone="brand"
              label={t.health.bloodPressure}
              value={bp && bp.valueSecondary != null ? `${bp.value}/${bp.valueSecondary}` : null}
              unit="mmHg"
              when={bp ? readingStamp(bp.measuredAt, locale) : null}
            />
            <div className="border-border-default border-t" />
            <MeasurementRow
              href="/health/measurements/weight"
              icon={<Weight size={22} className="text-feedback-success-text" aria-hidden />}
              tone="success"
              label={t.health.weight}
              value={weight ? String(weight.value) : null}
              unit="kg"
              when={weight ? readingStamp(weight.measuredAt, locale) : null}
            />
          </div>
        </section>

        {/* Not filtered by the date, and never should be. */}
        <DocumentsSection
          documents={overview.documents}
          accountId={accountId}
          canAdd={canEdit}
          addLabel={t.documents.uploadDocument}
          emptyMessage={t.family.noDocumentsYet}
        />
      </main>
    </div>
  );
}
