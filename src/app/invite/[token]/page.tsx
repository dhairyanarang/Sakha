import { createHash } from "node:crypto";
import Link from "next/link";
import { Check, Eye, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/account";
import { AcceptInvitation } from "@/components/profile/accept-invitation";
import { getMessages } from "@/lib/i18n/server";

/**
 * Opening a family invitation.
 *
 * Five states, in the order they are reached: an intro before sign-in, the
 * access confirmation after it, "you already have access" for someone who
 * accepted before, and a dead end for a link that is expired, cancelled, used
 * or simply wrong.
 *
 * The invited person never touches onboarding. Onboarding builds an account
 * for an elderly person to manage her own day; this person is here to look in
 * on someone else's, and asking them for a name and their medicines would be
 * asking the wrong human being entirely. Accepting drops them straight onto
 * her Home.
 *
 * What they can and cannot do is spelled out BEFORE the button, not after.
 */

/** The frame every state on this screen sits in. */
function Screen({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-6 px-4 pt-10 pb-4">{children}</main>
      <footer className="shrink-0 px-4" style={{ paddingBottom: "var(--spacing-7)" }}>
        {footer}
      </footer>
    </div>
  );
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const t = await getMessages();

  // The raw token never leaves this request. It is hashed here and the
  // database is asked "does this hash match a live invitation" — it is never
  // handed anything reusable.
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const supabase = await createClient();
  const { data } = await supabase.rpc("invitation_preview", { p_token_hash: tokenHash });
  const invitation = Array.isArray(data) ? data[0] : null;
  const state = invitation?.state ?? "missing";

  // invitation_preview is security definer and reachable before sign-in, which
  // it has to be — whoever opens this link is a member of nothing yet, so RLS
  // would show them an empty screen. It answers only to a hash that cannot be
  // produced without the link itself, and returns the inviter's name and
  // nothing else about the account.
  const { user, memberships } = await getViewer();

  if (!invitation || (state !== "pending" && state !== "accepted")) {
    const reason =
      state === "cancelled"
        ? t.invitations.wasCancelled
        : state === "expired"
          ? t.invitations.expired
          : t.invitations.notFound;
    return (
      <Screen
        footer={
          <Link
            href="/"
            className="bg-surface-default border-action-primary text-action-primary text-button-label flex h-[60px] w-full items-center justify-center rounded-xl border"
          >
            {t.invitations.goToSakha}
          </Link>
        }
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="bg-surface-subtle flex size-[88px] items-center justify-center rounded-full">
            <X size={36} className="text-text-tertiary" aria-hidden />
          </span>
          <h1 className="text-text-primary text-[20px] leading-[1.4] font-medium">{reason}</h1>
          <p className="text-[16px] leading-[1.4] text-[#636366]">{t.invitations.askForNew}</p>
        </div>
      </Screen>
    );
  }

  const inviter = invitation.inviter_name;
  const alreadyIn = memberships.some((m) => m.accountId === invitation.account_id);

  // Accepted, and it was this person who accepted it: not a dead end, they
  // simply already have what the link was offering. An accepted link opened by
  // anyone ELSE is a forwarded one, and gets the used-up wall below.
  if (alreadyIn) {
    return (
      <Screen
        footer={
          <Link
            href="/"
            className="bg-action-primary text-text-on-brand text-button-label active:bg-action-primary-pressed flex h-[60px] w-full items-center justify-center rounded-xl transition-colors"
          >
            {t.invitations.openTheirSakha(inviter)}
          </Link>
        }
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="bg-feedback-success-surface flex size-[88px] items-center justify-center rounded-full">
            <Check size={36} className="text-feedback-success-text" aria-hidden />
          </span>
          <h1 className="text-text-primary text-[20px] leading-[1.4] font-medium">
            {t.invitations.alreadyConnected(inviter)}
          </h1>
          <p className="text-[16px] leading-[1.4] text-[#636366]">
            {t.invitations.alreadyConnectedBody}
          </p>
        </div>
      </Screen>
    );
  }

  if (state === "accepted") {
    return (
      <Screen
        footer={
          <Link
            href="/"
            className="bg-surface-default border-action-primary text-action-primary text-button-label flex h-[60px] w-full items-center justify-center rounded-xl border"
          >
            {t.invitations.goToSakha}
          </Link>
        }
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="bg-surface-subtle flex size-[88px] items-center justify-center rounded-full">
            <X size={36} className="text-text-tertiary" aria-hidden />
          </span>
          <h1 className="text-text-primary text-[20px] leading-[1.4] font-medium">
            {t.invitations.alreadyUsed}
          </h1>
          <p className="text-[16px] leading-[1.4] text-[#636366]">{t.invitations.askForNew}</p>
        </div>
      </Screen>
    );
  }

  // Signed out: the invitation, and one button. Nothing about her health is
  // shown or fetched yet — accepting creates a real membership against a real
  // person, so who is accepting has to be established first.
  if (!user) {
    return (
      <Screen
        footer={
          <Link
            href={`/sign-in?next=/invite/${encodeURIComponent(token)}`}
            className="bg-action-primary text-text-on-brand text-button-label active:bg-action-primary-pressed flex h-[60px] w-full items-center justify-center rounded-xl transition-colors"
          >
            {t.welcome.getStarted}
          </Link>
        }
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/onboarding/sakha-mark.svg"
            alt=""
            width={69}
            height={69}
            className="size-[69px]"
          />
          <div className="flex flex-col gap-2">
            <h1 className="text-text-primary text-[24px] leading-[1.4] font-semibold">
              {t.invitations.invitedToSakha(inviter)}
            </h1>
            <p className="text-[18px] leading-[1.4] text-[#636366]">
              {t.invitations.stayUpdated}
            </p>
          </div>
        </div>
      </Screen>
    );
  }

  // Signed in, invitation live, not yet a member: the access confirmation.
  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-6 px-4 pt-10 pb-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="bg-surface-tinted flex size-[88px] items-center justify-center rounded-full">
            <Eye size={36} className="text-action-primary" aria-hidden />
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="text-text-primary text-[24px] leading-[1.4] font-semibold">
              {t.invitations.viewTheirSakha(inviter)}
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
              t.invitations.seeTodaysCare,
              t.invitations.seeMedicines,
              t.invitations.seeReadings,
              t.invitations.seeDocuments,
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <Check
                  size={20}
                  className="text-feedback-success-text mt-0.5 shrink-0"
                  aria-hidden
                />
                <span className="text-body-primary text-text-primary">{line}</span>
              </li>
            ))}
          </ul>
          <div className="border-border-default border-t" />
          {/* The limit, stated as plainly as the access. */}
          <div className="flex items-start gap-3">
            <X size={20} className="text-text-tertiary mt-0.5 shrink-0" aria-hidden />
            <span className="text-body-primary text-text-secondary">
              {t.invitations.cannotChange(inviter)}
            </span>
          </div>
        </div>
      </main>

      <AcceptInvitation token={token} />
    </div>
  );
}
