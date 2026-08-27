import type { Viewport } from "next";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/account";
import { getHomeData } from "@/lib/home-data";
import { greeting, longDate } from "@/lib/today";
import { BottomNav } from "@/components/ui";
import { MoodCard } from "@/components/home/mood-card";
import { TodaysCare } from "@/components/home/todays-care";

/* Home's header is the indigo gradient, so the status bar behind it should be
   too — otherwise a pale band sits above the gradient in a standalone PWA. */
export const viewport: Viewport = { themeColor: "#5551FF" };

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/welcome");

  const account = await getActiveAccount();
  if (!account) redirect("/onboarding/name");

  const home = await getHomeData(account.accountId);

  return (
    /* The gradient lives on the root, not the header, so it also fills the
       area behind the status bar and shows through the tinted sheet's rounded
       top corners. Rounding against the body — the same colour — made those
       corners invisible. */
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(to_right,var(--brand-500),var(--brand-700))]">
      <header
        className="shrink-0 px-4 pb-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + var(--spacing-3))" }}
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/onboarding/sakha-mark-white.svg"
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0"
          />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <p className="text-text-on-brand truncate text-[20px] leading-[1.2] font-medium">
              {greeting()}, {account.displayName}
            </p>
            <p className="text-text-on-brand text-[14px] leading-[1.2]">{longDate()}</p>
          </div>
          {/* Profile lands in Phase 6; this is the persistent avatar slot. */}
          <span
            title="Profile"
            className="bg-surface-tinted text-action-primary flex size-[52px] shrink-0 items-center justify-center rounded-full"
          >
            <User size={24} aria-hidden />
          </span>
        </div>
      </header>

      <main className="bg-surface-tinted flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain rounded-t-[36px] p-4">
        <MoodCard mood={home.mood} />
        <TodaysCare data={home} />
      </main>

      <BottomNav active="home" className="shrink-0" />
    </div>
  );
}
