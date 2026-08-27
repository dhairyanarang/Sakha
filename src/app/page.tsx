import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/account";
import { getHomeData } from "@/lib/home-data";
import { greeting, longDate } from "@/lib/today";
import { BottomNav } from "@/components/ui";
import { MoodCard } from "@/components/home/mood-card";
import { TodaysCare } from "@/components/home/todays-care";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/welcome");

  const account = await getActiveAccount();
  if (!account) redirect("/onboarding/name");

  const home = await getHomeData(account.accountId);

  return (
    <div className="bg-surface-tinted flex min-h-0 flex-1 flex-col overflow-hidden">
      <header
        className="shrink-0 px-4 pb-4"
        style={{ paddingTop: "var(--spacing-3)" }}
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/onboarding/sakha-mark.svg"
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0"
          />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <p className="text-action-primary truncate text-[20px] leading-[1.2] font-medium">
              {greeting()}, {account.displayName}
            </p>
            <p className="text-action-primary text-[14px] leading-[1.2]">{longDate()}</p>
          </div>
          {/* Profile lands in Phase 6; this is the persistent avatar slot. */}
          <span
            title="Profile"
            className="bg-action-primary text-text-on-brand flex size-[52px] shrink-0 items-center justify-center rounded-full"
          >
            <User size={24} aria-hidden />
          </span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pt-2 pb-4">
        <MoodCard mood={home.mood} />
        <TodaysCare data={home} />
      </main>

      <BottomNav active="home" className="shrink-0" />
    </div>
  );
}
