import { Eye, Mail, User, Users } from "lucide-react";
import { BottomNav, SectionHeading } from "@/components/ui";
import { Preferences } from "@/components/profile/preferences";
import { getT } from "@/lib/i18n/server";
import type { FamilyProfile as FamilyProfileData } from "@/lib/profile-data";
import type { Membership } from "@/lib/account";
import { Accounts } from "@/components/profile/accounts";
import { SignOut } from "@/components/profile/sign-out";

/**
 * Profile, for a family member.
 *
 * Deliberately NOT hers with things removed. This screen is about the person
 * holding the phone: who they are signed in as, whose account they can see,
 * and the language they read in. It carries no name field, no photo picker and
 * no invitation list, because none of those are theirs to change — her name
 * and her photo belong to her account, and the guest list is hers alone.
 *
 * Language is the one preference here that is genuinely theirs. A son in Delhi
 * may read English while his mother reads Hindi; his choice lives in a cookie
 * on his own device and rewrites nothing on her account.
 */
export async function FamilyProfile({
  profile,
  language,
  memberships,
}: {
  profile: FamilyProfileData;
  language: string;
  /** Every account this person belongs to, so they can get back to their own. */
  memberships: Membership[];
}) {
  const { t } = await getT();

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <header className="shrink-0 px-4 pt-2 pb-3">
        <p className="text-text-primary text-[20px] leading-[1.2] font-medium">
          {t.profile.title}
        </p>
        <p className="text-text-primary mt-0.5 text-[14px] leading-[1.2]">
          {t.family.profileSubtitle}
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-[30px] px-4 py-2">
        <section className="flex shrink-0 flex-col items-center gap-3">
          <span className="bg-surface-tinted flex size-[96px] items-center justify-center overflow-hidden rounded-full">
            {profile.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <User size={44} className="text-action-primary" aria-hidden />
            )}
          </span>
          <div className="flex flex-col items-center gap-1">
            <p className="text-text-primary text-[20px] leading-[1.2] font-medium">
              {profile.name ?? t.profile.you}
            </p>
            {profile.email ? (
              <span className="flex items-center gap-1.5">
                <Mail size={16} className="text-text-tertiary shrink-0" aria-hidden />
                {/* rgba(0,0,0,0.4) over surface/page, resolved to a solid. */}
                <span className="text-[14px] leading-[1.2] text-[#999999]">
                  {profile.email}
                </span>
              </span>
            ) : null}
          </div>
        </section>

        <section className="flex shrink-0 flex-col gap-3">
          <SectionHeading>{t.family.yourAccess}</SectionHeading>

          <div className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] px-4 py-[18px]">
            <div className="flex items-center gap-4">
              <Users size={22} className="text-text-primary shrink-0" aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="text-text-primary truncate text-[18px] leading-[1.2] font-medium">
                  {profile.accountName}
                </p>
                <p className="text-[16px] leading-[1.2] text-[#999999]">
                  {/* The RAW relation, not a translated label — Hindi has to
                      inflect it (बेटा -> बेटे) and only it knows how. */}
                  {t.family.connectedAs(profile.relation)}
                </p>
              </div>
            </div>

            <div className="border-border-default mx-auto w-full max-w-[299px] border-t" />

            {/* The limit, restated where they will look for it later. Someone
                who has forgotten what they agreed to should be able to find
                out without asking her. */}
            <div className="flex items-start gap-4">
              <Eye size={22} className="text-action-primary mt-0.5 shrink-0" aria-hidden />
              <p className="text-body-primary text-text-secondary flex-1">
                {t.family.viewOnlyExplainer(profile.accountName)}
              </p>
            </div>
          </div>
        </section>

        <Accounts accounts={memberships} activeId={profile.accountId} />

        {/* Language only. The reminders row asks the browser to allow pushes
            about HER medicines, and nothing is built yet that would notify a
            family member about anything — offering the switch would promise a
            feature that does not exist. */}
        <Preferences language={language} showReminders={false} />

        <SignOut />
      </main>

      <BottomNav active="profile" variant="family" className="shrink-0" />
    </div>
  );
}
