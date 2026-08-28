import { createHash } from "node:crypto";
import Link from "next/link";
import { Check, Eye, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AcceptInvitation } from "@/components/profile/accept-invitation";
import { getMessages } from "@/lib/i18n/server";

/**
 * Opening a family invitation.
 *
 * Sign-in comes first, deliberately: accepting creates a real membership
 * against a real person, so we need to know who is accepting before showing
 * anything about her account. Until then the page says only that an invitation
 * exists — no name, no data.
 *
 * What he can and cannot do is spelled out before the button, not after.
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const t = await getMessages();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="bg-surface-page flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/onboarding/sakha-mark.svg" alt="" width={69} height={69} className="size-[69px]" />
          <div className="flex flex-col gap-2">
            <h1 className="text-text-primary text-[24px] leading-[1.4] font-semibold">
              {t.invitations.acceptTitle}
            </h1>
            <p className="text-[16px] leading-[1.4] text-[#636366]">
              {t.invitations.acceptSignIn}
            </p>
          </div>
        </main>
        <footer className="shrink-0 px-4" style={{ paddingBottom: "var(--spacing-7)" }}>
          <Link
            href={`/sign-in?next=/invite/${encodeURIComponent(token)}`}
            className="bg-action-primary text-text-on-brand text-button-label active:bg-action-primary-pressed flex h-[60px] w-full items-center justify-center rounded-xl transition-colors"
          >
            {t.common.continue}
          </Link>
        </footer>
      </div>
    );
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data } = await supabase.rpc("invitation_preview", { p_token_hash: tokenHash });
  const invitation = Array.isArray(data) ? data[0] : null;
  const state = invitation?.state ?? "missing";

  if (!invitation || state !== "pending") {
    const reason =
      state === "accepted"
        ? t.invitations.alreadyUsed
        : state === "cancelled"
          ? t.invitations.wasCancelled
          : state === "expired"
            ? t.invitations.expired
            : t.invitations.notFound;
    return (
      <div className="bg-surface-page flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="bg-surface-subtle flex size-[88px] items-center justify-center rounded-full">
            <X size={36} className="text-text-tertiary" aria-hidden />
          </span>
          <h1 className="text-text-primary text-[20px] leading-[1.4] font-medium">{reason}</h1>
          <p className="text-[16px] leading-[1.4] text-[#636366]">
            {t.invitations.askForNew}
          </p>
        </main>
        <footer className="shrink-0 px-4" style={{ paddingBottom: "var(--spacing-7)" }}>
          <Link
            href="/"
            className="bg-surface-default border-action-primary text-action-primary text-button-label flex h-[60px] w-full items-center justify-center rounded-xl border"
          >
            {t.invitations.goToSakha}
          </Link>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-6 px-4 pt-10 pb-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="bg-surface-tinted flex size-[88px] items-center justify-center rounded-full">
            <Eye size={36} className="text-action-primary" aria-hidden />
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="text-text-primary text-[24px] leading-[1.4] font-semibold">
              {t.invitations.invitedBy(invitation.inviter_name)}
            </h1>
            <p className="text-[16px] leading-[1.4] text-[#636366]">
              {t.invitations.asTheirRelation(invitation.relation)}
            </p>
          </div>
        </div>

        <div className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] p-4">
          <p className="text-body-medium text-text-primary">{t.invitations.youWillSee}</p>
          <ul className="flex flex-col gap-3">
            {[
              t.invitations.seeMedicines,
              t.invitations.seeReadings,
              t.invitations.seeDocuments,
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <Check size={20} className="text-feedback-success-text mt-0.5 shrink-0" aria-hidden />
                <span className="text-body-primary text-text-primary">{line}</span>
              </li>
            ))}
          </ul>
          <div className="border-border-default border-t" />
          {/* The limit, stated as plainly as the access. */}
          <div className="flex items-start gap-3">
            <X size={20} className="text-text-tertiary mt-0.5 shrink-0" aria-hidden />
            <span className="text-body-primary text-text-secondary">
              {t.invitations.cannotChange(invitation.inviter_name)}
            </span>
          </div>
        </div>
      </main>

      <AcceptInvitation token={token} inviter={invitation.inviter_name} />
    </div>
  );
}
