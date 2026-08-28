"use client";

import { useTransition } from "react";
import { Check, ChevronRight, Eye, User } from "lucide-react";
import { SectionHeading } from "@/components/ui";
import { switchAccount } from "@/app/profile/actions";
import { useT } from "@/lib/i18n/client";
import { relationLabel } from "@/lib/i18n/labels";

export type AccountOption = {
  accountId: string;
  displayName: string;
  role: "owner" | "family";
  relation: string | null;
};

/**
 * Which account is open, and how to open another.
 *
 * DESIGNED IN CODE. Figma has no frame for this — like the family screens and
 * the walk check-in, it is assembled from parts that already exist: the same
 * card, icon circle and row shape as "My Profile" directly above it, so it
 * reads as one more row rather than a new kind of thing.
 *
 * It renders only for someone who belongs to more than one account. Most
 * people have exactly one, and a switcher offering a single choice is a
 * control that does nothing — worse than absent, because it implies there is
 * somewhere else to be.
 *
 * The account currently open is shown as a plain row with a tick, not as a
 * button that does nothing. Everything else is a real target: one tap, no
 * confirmation, because switching is reversible and costs nothing to undo.
 */
export function Accounts({
  accounts,
  activeId,
}: {
  accounts: AccountOption[];
  activeId: string;
}) {
  const t = useT();
  const [pending, startTransition] = useTransition();

  // One account is not a choice.
  if (accounts.length < 2) return null;

  function open(accountId: string) {
    startTransition(async () => {
      await switchAccount(accountId);
    });
  }

  return (
    <section className="flex shrink-0 flex-col gap-3">
      <SectionHeading>{t.profile.accounts}</SectionHeading>

      <div className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] px-3 py-4">
        {accounts.map((account, i) => {
          const isActive = account.accountId === activeId;
          const isOwn = account.role === "owner";

          const describes = isOwn
            ? t.profile.yourOwnAccount
            : account.relation
              ? t.profile.viewOnlyRelation(relationLabel(account.relation, t))
              : t.profile.viewOnly;

          const inner = (
            <>
              <span
                className={`flex size-[44px] shrink-0 items-center justify-center rounded-full ${
                  isOwn ? "bg-surface-tinted" : "bg-surface-subtle"
                }`}
              >
                {isOwn ? (
                  <User size={22} className="text-action-primary" aria-hidden />
                ) : (
                  <Eye size={22} className="text-text-tertiary" aria-hidden />
                )}
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-1.5 text-left">
                <span className="text-text-primary truncate text-[16px] leading-[1.2] font-medium">
                  {account.displayName}
                </span>
                {/* rgba(0,0,0,0.4) over surface/default, resolved to a solid. */}
                <span className="truncate text-[14px] leading-[1.2] text-[#999999]">
                  {describes}
                </span>
                {/* Its own line rather than appended to the one above: joined
                    with a middot the pair needed 186px in Hindi and had 175 on
                    a 320px screen, so it lost its own last word. Stacked, both
                    lines fit whole and the tick sits with the words it means. */}
                {isActive ? (
                  <span className="text-feedback-success-text flex items-center gap-1 text-[14px] leading-[1.2] font-medium">
                    <Check size={16} className="shrink-0" aria-hidden />
                    <span className="truncate">{t.profile.currentlyOpen}</span>
                  </span>
                ) : null}
              </span>
            </>
          );

          return (
            <div key={account.accountId} className="flex flex-col gap-4">
              {i > 0 ? <div className="border-border-default ml-[56px] border-t" /> : null}

              {isActive ? (
                <div aria-current="true" className="flex items-center gap-3 px-0 py-1">
                  {inner}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => open(account.accountId)}
                  disabled={pending}
                  aria-label={t.profile.switchTo(account.displayName)}
                  className="active:bg-surface-tinted -mx-2 flex items-center gap-3 rounded-md px-2 py-1 transition-colors disabled:opacity-60"
                >
                  {inner}
                  <ChevronRight
                    size={20}
                    className="text-text-tertiary shrink-0"
                    aria-hidden
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
