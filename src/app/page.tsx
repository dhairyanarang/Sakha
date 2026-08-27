import { requireAccount } from "@/lib/account";
import { getHomeData } from "@/lib/home-data";
import { BottomNav } from "@/components/ui";
import { AppHeader } from "@/components/app-header";
import { MoodCard } from "@/components/home/mood-card";
import { TodaysCare } from "@/components/home/todays-care";

export default async function HomePage() {
  const { account } = await requireAccount();

  const home = await getHomeData(account.accountId);

  return (
    <div className="bg-surface-tinted flex flex-1 flex-col">
      <AppHeader name={account.displayName} />

      <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-4">
        <MoodCard mood={home.mood} />
        <TodaysCare data={home} />
      </main>

      <BottomNav active="home" className="shrink-0" />
    </div>
  );
}
