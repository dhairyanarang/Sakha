import { requireAccount } from "@/lib/account";
import { getHomeData } from "@/lib/home-data";
import { greeting } from "@/lib/today";
import { getT } from "@/lib/i18n/server";
import { BottomNav } from "@/components/ui";
import { AppHeader } from "@/components/app-header";
import { getHeaderAvatar } from "@/lib/profile-data";
import { TodaysCare } from "@/components/home/todays-care";
import { FamilyHome } from "@/components/family/family-home";

/**
 * Home — two entirely different screens behind one URL.
 *
 * She is asking "what do I need to do today". A family member is asking "how
 * is she doing". Those are different questions, so they get different screens
 * rather than one screen with pieces hidden — see components/family/home.
 *
 * The URL stays shared on purpose: the bottom nav, every prefetch and the
 * redirect after accepting an invitation all point at "/", and a link she
 * sends her son should open for both of them.
 */
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { account, isFamily } = await requireAccount();

  if (isFamily) {
    // ?d=YYYY-MM-DD chooses the day Family View shows. In the URL rather than
    // client state, so back works and a refresh keeps the day.
    const { d } = await searchParams;
    const date = typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
    return (
      <FamilyHome
        accountId={account.accountId}
        ownerName={account.displayName}
        date={date}
      />
    );
  }

  const { locale } = await getT();
  const [home, avatarUrl] = await Promise.all([
    getHomeData(account.accountId),
    getHeaderAvatar(),
  ]);

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <AppHeader avatarUrl={avatarUrl}>
        {/* rgba(0,0,0,0.6) over surface/page, resolved to a solid value. */}
        <p className="text-[16px] leading-[1.2] text-[#636366]">{greeting(locale)},</p>
        <p className="text-text-primary mt-1.5 truncate text-[20px] leading-[1.2] font-medium">
          {account.displayName}
        </p>
      </AppHeader>

      <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-4">
        <TodaysCare data={home} canEdit />
      </main>

      <BottomNav active="home" className="shrink-0" />
    </div>
  );
}
