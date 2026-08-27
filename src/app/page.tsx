import { requireAccount } from "@/lib/account";
import { Eye } from "lucide-react";
import { getHomeData } from "@/lib/home-data";
import { greeting } from "@/lib/today";
import { BottomNav } from "@/components/ui";
import { AppHeader } from "@/components/app-header";
import { getHeaderAvatar } from "@/lib/profile-data";
import { MoodCard } from "@/components/home/mood-card";
import { TodaysCare } from "@/components/home/todays-care";

export default async function HomePage() {
  const { account, canEdit } = await requireAccount();

  const home = await getHomeData(account.accountId);
  const avatarUrl = await getHeaderAvatar();

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <AppHeader avatarUrl={avatarUrl}>
        {/* rgba(0,0,0,0.6) over surface/page, resolved to a solid value. */}
        <p className="text-[16px] leading-[1.2] text-[#636366]">{greeting()},</p>
        <p className="text-text-primary mt-1.5 truncate text-[20px] leading-[1.2] font-medium">
          {account.displayName}
        </p>
      </AppHeader>

      <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-4">
        {/* Viewing someone else's account is stated plainly and at the top,
            not implied by missing buttons. */}
        {!canEdit ? (
          <div className="bg-surface-tinted border-action-primary flex shrink-0 items-center gap-3 rounded-sm border px-3 py-2.5">
            <Eye size={22} className="text-action-primary shrink-0" aria-hidden />
            <p className="text-action-primary text-[16px] leading-[1.4]">
              You are viewing {account.displayName}&apos;s information. You cannot
              change anything.
            </p>
          </div>
        ) : null}

        {canEdit ? <MoodCard mood={home.mood} /> : null}
        <TodaysCare data={home} canEdit={canEdit} />
      </main>

      <BottomNav active="home" className="shrink-0" />
    </div>
  );
}
