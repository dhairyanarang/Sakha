import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, User } from "lucide-react";
import { getInvitations, getProfile } from "@/lib/profile-data";
import { ScreenHeader } from "@/components/screen-header";
import { Invitations } from "@/components/profile/invitations";
import { Preferences } from "@/components/profile/preferences";

/**
 * Profile — her own details, who else can see the account, and preferences.
 *
 * Invitations are view-only by construction: a family member reads everything
 * on the account and writes nothing, enforced in the database rather than by
 * hiding buttons.
 */
export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/welcome");

  const { members, pending } = await getInvitations(profile.accountId);

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <ScreenHeader backHref="/" title="Profile" subtitle="Manage your Profile" />

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
              My Profile
            </span>
            {/* rgba(0,0,0,0.4) over surface/default, resolved to a solid. */}
            <span className="truncate text-[16px] leading-[1.2] text-[#999999]">
              {profile.displayName}
            </span>
          </span>
          <ChevronRight size={20} className="text-text-tertiary shrink-0" aria-hidden />
        </Link>

        <Invitations members={members} pending={pending} />

        <Preferences language={profile.language} />
      </main>
    </div>
  );
}
