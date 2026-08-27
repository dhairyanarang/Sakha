import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, User, Users } from "lucide-react";
import { getProfile } from "@/lib/profile-data";
import { EmptyState } from "@/components/ui";
import { ScreenHeader } from "@/components/screen-header";
import { Preferences } from "@/components/profile/preferences";

/**
 * Profile — her own details, who else can see the account, and preferences.
 *
 * NOT BUILT YET: sending an invitation. The frames show family cards and an
 * invite tile, but the flow behind them — what a link contains, what the
 * person opening it sees, how accepting grants view-only access — has never
 * been designed, and is the one thing the IA still lists as unresolved. The
 * section renders its empty state and the tile is disabled rather than leading
 * nowhere. See the note to the user; the flow is being agreed first.
 */
export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/welcome");

  const family = profile.members.filter((m) => m.role === "family");

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

        <section className="flex shrink-0 flex-col gap-3">
          <h2 className="text-subsection-heading text-action-primary uppercase tracking-[0.04em]">
            Invitations
          </h2>

          {family.length === 0 ? (
            <EmptyState
              message="You have no invitations."
              illustration={
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/empty/invitations.webp"
                  alt=""
                  aria-hidden
                  className="h-[124px] w-[179px] object-contain"
                />
              }
            />
          ) : (
            <div className="flex flex-wrap gap-3">
              {family.map((member) => (
                <div
                  key={member.accountId}
                  className="bg-surface-default border-border-soft flex min-w-0 flex-1 flex-col items-center justify-center gap-2.5 rounded-xl border-[0.5px] px-3 py-4"
                >
                  <span className="bg-surface-tinted flex size-[50px] shrink-0 items-center justify-center rounded-full">
                    <Users size={24} className="text-action-primary" aria-hidden />
                  </span>
                  <span className="flex w-full flex-col gap-1 text-center">
                    <span className="text-name-label text-text-primary truncate">
                      {member.displayName}
                    </span>
                    <span className="truncate text-[14px] leading-[1.2] text-[#999999]">
                      {member.role === "family" ? "Family" : "Owner"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Deliberately inert until the invitation flow is agreed. A button
              that opens nothing is worse than one that says it is not ready. */}
          <button
            type="button"
            disabled
            title="Coming soon"
            className="bg-surface-page border-action-primary text-action-primary flex h-[60px] w-full items-center justify-center rounded-xl border text-[16px] leading-[1.2] font-medium opacity-50"
          >
            + Invite Family Member
          </button>
        </section>

        <Preferences language={profile.language} />
      </main>
    </div>
  );
}
