import { BottomNav, SectionHeading } from "@/components/ui";
import { AppHeader } from "@/components/app-header";
import { DocumentRow } from "@/components/health/document-row";
import { getFamilyHome } from "@/lib/family-data";
import { getHeaderAvatar } from "@/lib/profile-data";
import { relativeWhen } from "@/lib/today";
import { getT } from "@/lib/i18n/server";
import { ViewingBanner } from "./viewing-banner";
import { RecentUpdates } from "./recent-updates";
import { CareHistory } from "./care-history";
import { FamilyHealthOverview } from "./health-overview";
import { DateContext } from "./date-context";
import { DayCare } from "./day-care";
import { getCareDay } from "@/lib/care-history";
import { localDate } from "@/lib/today";

/**
 * Home, for someone looking in on another person's account.
 *
 * The owner's Home asks "what do I need to do today" and is built out of
 * actions: confirm this dose, record that reading, log a walk. This one asks
 * "how is she doing" and is built out of what has already happened. It is not
 * her Home with the buttons removed — the order is different, the leading
 * section is different, and there is nothing on it to tap that changes
 * anything.
 *
 * Recent Updates leads because it is the reason the app was opened. Health
 * Overview sits under it as the way through to detail, and documents last.
 */
export async function FamilyHome({
  accountId,
  ownerName,
  date,
}: {
  accountId: string;
  ownerName: string;
  /** A past day to show instead of today. Null is today, and is the default. */
  date?: string | null;
}) {
  const { t, locale } = await getT();

  /**
   * Today keeps the rolling feed; a chosen day shows only that day.
   *
   * Today's question is "what has been going on", and a window of recent
   * activity answers it. A chosen date asks "how did that day go", where
   * anything from the days either side would only blur the answer. Same
   * screen, same components, one branch.
   */
  const historical = date && date !== localDate() ? date : null;

  /**
   * Only fetch the view being rendered.
   *
   * These are two different screens sharing one URL, and each costs a handful
   * of round trips to Mumbai. Asking for the rolling feed while showing a past
   * day meant six queries whose results were thrown away on every date tapped.
   */
  const [home, avatarUrl, day] = await Promise.all([
    historical ? Promise.resolve(null) : getFamilyHome(accountId),
    getHeaderAvatar(),
    historical ? getCareDay(accountId, historical) : Promise.resolve(null),
  ]);

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
        <ViewingBanner name={ownerName} />

        {historical ? (
          <>
            <DateContext date={historical} />
            {/* The calendar stays reachable from the day you are already on,
                so moving between days does not mean going back to today
                first. */}
            <div className="flex items-center justify-end">
              <CareHistory accountId={accountId} selected={historical} />
            </div>
            {day ? (
              <DayCare day={day} />
            ) : (
              <div className="bg-surface-default border-border-soft rounded-xl border-[0.5px] px-4 py-5">
                <p className="text-body-medium text-text-secondary">
                  {t.family.noCareThatDay}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <RecentUpdates
              updates={home?.updates ?? []}
              historyAction={<CareHistory accountId={accountId} />}
            />

            {home ? (
              <FamilyHealthOverview
                latest={home.latest}
                medicines={home.medicines}
                heading={t.family.healthOverview}
              />
            ) : null}

            {/* Today-only, for the same reason Health Overview is: "recent
                documents" is a rolling list, and showing it under a date
                banner reading 29 August would contradict itself. That day's
                own documents are listed by DayCare. */}
            <section className="flex shrink-0 flex-col gap-2.5">
              <SectionHeading>{t.family.recentDocuments}</SectionHeading>
              {(home?.documents ?? []).length === 0 ? (
                <div className="bg-surface-default border-border-soft rounded-xl border-[0.5px] px-4 py-5">
                  <p className="text-body-medium text-text-secondary">
                    {t.family.noDocumentsYet}
                  </p>
                </div>
              ) : (
                (home?.documents ?? []).map((d) => (
                  <DocumentRow
                    key={d.id}
                    href={`/health/documents/${d.id}`}
                    title={d.title}
                    when={relativeWhen(d.at, locale)}
                  />
                ))
              )}
            </section>
          </>
        )}

      </main>

      <BottomNav active="home" variant="family" className="shrink-0" />
    </div>
  );
}
