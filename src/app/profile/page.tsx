import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, User } from "lucide-react";
import { getMemberships, getActiveAccount, requireAccount } from "@/lib/account";
import { getFamilyProfile, getInvitations, getProfile } from "@/lib/profile-data";
import { ScreenHeader } from "@/components/screen-header";
import { Invitations } from "@/components/profile/invitations";
import { Preferences } from "@/components/profile/preferences";
import { Accounts } from "@/components/profile/accounts";
import { SignOut } from "@/components/profile/sign-out";
import { FamilyProfile } from "@/components/family/family-profile";
import { getMessages, getLocale } from "@/lib/i18n/server";

/**
 * Profile — hers, or a family member's own.
 *
 * These are two different screens and always were; until now a family member
 * opening this route was handed HER profile — her name in the edit field, her
 * invitation list, her language chips — because the profile lookup fell back
 * to whatever account it could find. Every write behind it failed at RLS, so
 * nothing could actually be changed, but the screen was still a lie.
 *
 * Her Profile shows her details, who else can see the account, and her
 * preferences. Invitations are view-only by construction: a family member
 * reads everything on the account and writes nothing, enforced in the database
 * rather than by hiding buttons.
 */
export default async function ProfilePage() {
  const { isFamily } = await requireAccount();

  if (isFamily) {
    const [family, memberships] = await Promise.all([getFamilyProfile(), getMemberships()]);
    if (!family) redirect("/");
    return (
      <FamilyProfile
        profile={family}
        language={await getLocale()}
        memberships={memberships}
      />
    );
  }

  const profile = await getProfile();
  if (!profile) redirect("/welcome");

  const [{ members, pending }, t, memberships, active] = await Promise.all([
    getInvitations(profile.accountId),
    getMessages(),
    getMemberships(),
    getActiveAccount(),
  ]);

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <ScreenHeader backHref="/" title={t.profile.title} subtitle={t.profile.subtitle} />

      <main className="flex flex-1 flex-col gap-[30px] px-4 py-2">
        <Link
          href="/profile/me"
          prefetch
          className="bg-surface-default border-border-soft flex shrink-0 items-center gap-3 rounded-xl border-[0.5px] px-3 py-4"
        >
          <span className="bg-surface-tinted flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full">
            {profile.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <User size={24} className="text-action-primary" aria-hidden />
            )}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-text-primary text-[16px] leading-[1.2] font-medium">
              {t.profile.myProfile}
            </span>
            {/* rgba(0,0,0,0.4) over surface/default, resolved to a solid. */}
            <span className="truncate text-[16px] leading-[1.2] text-[#999999]">
              {profile.displayName}
            </span>
          </span>
          <ChevronRight size={20} className="text-text-tertiary shrink-0" aria-hidden />
        </Link>

        <Accounts accounts={memberships} activeId={active?.accountId ?? profile.accountId} />

        <Invitations members={members} pending={pending} />

        <Preferences language={profile.language} />

        <SignOut />
      </main>
    </div>
  );
}
