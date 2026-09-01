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
}: {
  accountId: string;
  ownerName: string;
}) {
  const { t, locale } = await getT();
  const [home, avatarUrl] = await Promise.all([
    getFamilyHome(accountId),
    getHeaderAvatar(),
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

        <RecentUpdates updates={home.updates} historyAction={<CareHistory accountId={accountId} />} />

        <FamilyHealthOverview
          latest={home.latest}
          medicines={home.medicines}
          heading={t.family.healthOverview}
        />

        <section className="flex shrink-0 flex-col gap-2.5">
          <SectionHeading>{t.family.recentDocuments}</SectionHeading>
          {home.documents.length === 0 ? (
            <div className="bg-surface-default border-border-soft rounded-xl border-[0.5px] px-4 py-5">
              <p className="text-body-medium text-text-secondary">
                {t.family.noDocumentsYet}
              </p>
            </div>
          ) : (
            home.documents.map((d) => (
              <DocumentRow
                key={d.id}
                href={`/health/documents/${d.id}`}
                title={d.title}
                when={relativeWhen(d.at, locale)}
              />
            ))
          )}
        </section>
      </main>

      <BottomNav active="home" variant="family" className="shrink-0" />
    </div>
  );
}
