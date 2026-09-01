import { BottomNav } from "@/components/ui";
import { AppHeader } from "@/components/app-header";
import { TodaysCare } from "@/components/home/todays-care";
import { DocumentsSection } from "@/components/health/documents-section";
import { getHomeData } from "@/lib/home-data";
import { getHealthOverview } from "@/lib/health-data";
import { getCareDay } from "@/lib/care-history";
import { getHeaderAvatar } from "@/lib/profile-data";
import { localDate } from "@/lib/today";
import { getT } from "@/lib/i18n/server";
import { CareHistory } from "./care-history";
import { DateContext } from "./date-context";
import { DayCare } from "./day-care";

/**
 * Home, for someone looking in on another person's account.
 *
 * One day at a time, and the same shape whichever day it is. It used to lead
 * with a rolling feed of everything that had happened lately, which answered
 * "what has been going on" by repeating "Morning medicine confirmed · 2 days
 * ago" three times and pushing her blood pressure off the bottom of the
 * screen. A day is the unit a family member actually thinks in.
 *
 * Today reuses her own Today's Care wholesale, with canEdit deciding whether
 * anything can be pressed — the design for this screen IS that component, so
 * reimplementing it would have been two things to keep in step. A chosen date
 * cannot reuse it, because a past day has no Record button and no "upcoming"
 * slot; it gets the read-only telling in DayCare instead.
 *
 * There is no "you are viewing X's information" banner. The header says
 * "Meenu's Sakha" two lines above it, and saying it twice was noise.
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
  /** A past day to show instead of today. Null is today, and is the default. */
  date?: string | null;
}) {
  const { t } = await getT();

  const historical = date && date !== localDate() ? date : null;

  /**
   * Only fetch the view being rendered.
   *
   * These are two different days sharing one URL and each costs several round
   * trips to Mumbai. Asking for today while showing a past day meant a set of
   * queries thrown away on every date tapped.
   */
  const [home, overview, avatarUrl, day] = await Promise.all([
    historical ? Promise.resolve(null) : getHomeData(accountId),
    getHealthOverview(accountId),
    getHeaderAvatar(),
    historical ? getCareDay(accountId, historical) : Promise.resolve(null),
  ]);

  const calendar = <CareHistory accountId={accountId} selected={historical ?? undefined} />;

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
        {historical ? (
          <>
            <DateContext date={historical} />
            {day ? (
              <DayCare day={day} date={historical} calendar={calendar} />
            ) : (
              <div className="bg-surface-default border-border-soft rounded-xl border-[0.5px] px-4 py-5">
                <p className="text-body-medium text-text-secondary">
                  {t.family.noCareThatDay}
                </p>
              </div>
            )}
          </>
        ) : home ? (
          <TodaysCare
            data={home}
            canEdit={canEdit}
            medicinesHeading={t.family.todaysMedicine}
            medicinesAction={calendar}
          />
        ) : null}

        {/* Documents are hers, not a day's — the same list on either view. */}
        <DocumentsSection
          documents={overview.documents}
          accountId={accountId}
          canAdd={canEdit}
          addLabel={t.documents.uploadDocument}
          emptyMessage={t.family.noDocumentsYet}
        />
      </main>

      <BottomNav active="home" variant="family" className="shrink-0" />
    </div>
  );
}
