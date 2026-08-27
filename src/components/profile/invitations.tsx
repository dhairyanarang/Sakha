"use client";

import { useState, useTransition } from "react";
import { Clock, Share2, Users } from "lucide-react";
import { Sheet } from "@/components/home/sheet";
import { Button, Chip, EmptyState, TextInput, Toast } from "@/components/ui";
import {
  cancelInvitation,
  createInvitation,
  revokeAccess,
} from "@/app/profile/actions";
import type { FamilyMember, PendingInvitation } from "@/lib/profile-data";

/**
 * Invitations — who can see this account, and who has been asked.
 *
 * An invitation is a link, not a message: no phone number is collected, and
 * sharing goes through the phone's own share sheet so it lands wherever she
 * already talks to her family. WhatsApp is offered directly beside it because
 * that is the one she actually uses.
 *
 * Everyone here gets VIEW-ONLY access. That is enforced in the database — a
 * family member's writes affect no rows — and said plainly on the screen so
 * she knows what she is handing over.
 */
const RELATIONS = ["Son", "Daughter", "Spouse", "Other"];

export function Invitations({
  members,
  pending,
}: {
  members: FamilyMember[];
  pending: PendingInvitation[];
}) {
  const [inviting, setInviting] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [customRelation, setCustomRelation] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmingRevoke, setConfirmingRevoke] = useState<FamilyMember | null>(null);
  const [pendingAction, startTransition] = useTransition();

  const isOther = relation === "Other";
  const resolvedRelation = isOther ? customRelation.trim() : relation;

  function openInvite() {
    setName("");
    setRelation("");
    setCustomRelation("");
    setLink(null);
    setError(null);
    setNonce((n) => n + 1);
    setInviting(true);
  }

  function create() {
    setError(null);
    startTransition(async () => {
      const result = await createInvitation({ name, relation: resolvedRelation });
      if ("error" in result) setError(result.error);
      else setLink(result.url);
    });
  }

  async function share(url: string, who: string) {
    const text = `${who}, here is a link to see my health information on Sakha.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Sakha", text, url });
        return;
      } catch {
        // Dismissing the share sheet is a normal outcome, not a failure.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast("Link copied.");
    } catch {
      setToast("Copy the link from the box above.");
    }
  }

  function cancel(id: string) {
    startTransition(async () => {
      const err = await cancelInvitation(id);
      setToast(err ?? "Invitation cancelled.");
    });
  }

  function revoke(member: FamilyMember) {
    startTransition(async () => {
      const err = await revokeAccess(member.userId);
      setConfirmingRevoke(null);
      setToast(err ?? `${member.name} can no longer see your information.`);
    });
  }

  const nothingYet = members.length === 0 && pending.length === 0;

  return (
    <section className="flex shrink-0 flex-col gap-3">
      <h2 className="text-subsection-heading text-action-primary uppercase tracking-[0.04em]">
        Invitations
      </h2>

      {nothingYet ? (
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
          {members.map((member) => (
            <div
              key={member.userId}
              className="bg-surface-default border-border-soft flex min-w-[calc(50%-6px)] flex-1 flex-col items-center gap-2.5 rounded-xl border-[0.5px] px-3 py-4"
            >
              <span className="bg-surface-tinted flex size-[50px] shrink-0 items-center justify-center rounded-full">
                <Users size={24} className="text-action-primary" aria-hidden />
              </span>
              <span className="flex w-full flex-col gap-1 text-center">
                <span className="text-name-label text-text-primary truncate">
                  {member.name}
                </span>
                <span className="truncate text-[14px] leading-[1.2] text-[#999999]">
                  {member.relation ?? "Family"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setConfirmingRevoke(member)}
                className="border-action-primary text-action-primary active:bg-surface-tinted w-full rounded-full border px-4 py-3 text-[16px] leading-[1.2] transition-colors"
              >
                Manage
              </button>
            </div>
          ))}

          {pending.map((invite) => (
            <div
              key={invite.id}
              className="bg-surface-default border-border-soft flex min-w-[calc(50%-6px)] flex-1 flex-col items-center gap-2.5 rounded-xl border-[0.5px] px-3 py-4"
            >
              <span className="bg-surface-subtle flex size-[50px] shrink-0 items-center justify-center rounded-full">
                <Clock size={24} className="text-text-tertiary" aria-hidden />
              </span>
              <span className="flex w-full flex-col gap-1 text-center">
                <span className="text-name-label text-text-primary truncate">
                  {invite.name}
                </span>
                {/* Says what it is waiting for, not how long it has been. */}
                <span className="truncate text-[14px] leading-[1.2] text-[#999999]">
                  Pending · {invite.relation}
                </span>
              </span>
              <button
                type="button"
                onClick={() => cancel(invite.id)}
                disabled={pendingAction}
                className="border-border-default text-text-secondary active:bg-surface-subtle w-full rounded-full border px-4 py-3 text-[16px] leading-[1.2] transition-colors"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={openInvite}
        className="bg-surface-page border-action-primary text-action-primary active:bg-surface-tinted flex h-[60px] w-full items-center justify-center rounded-xl border text-[16px] leading-[1.2] font-medium transition-colors"
      >
        + Invite Family Member
      </button>

      <Sheet
        key={nonce}
        open={inviting}
        onClose={() => setInviting(false)}
        title="Invite Family Member"
      >
        <div className="flex flex-col gap-6">
          {link ? (
            <>
              <div className="bg-feedback-success-surface flex flex-col gap-2 rounded-md p-4">
                <p className="text-body-medium text-text-primary">
                  Your invitation is ready
                </p>
                <p className="text-body-secondary text-text-secondary">
                  Send this link to {name}. It works once, and stops working after
                  14 days.
                </p>
              </div>
              <p className="bg-surface-subtle text-text-secondary rounded-md p-3 text-[14px] break-all">
                {link}
              </p>
            </>
          ) : (
            <>
              <TextInput
                label="Their Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul"
                autoComplete="off"
              />

              <div className="flex flex-col gap-2.5">
                <span className="text-[14px] leading-[1.2] font-medium text-[#636366]">
                  How are they related to you?
                </span>
                <div className="flex flex-wrap gap-2">
                  {RELATIONS.map((r) => (
                    <Chip
                      key={r}
                      selected={relation === r}
                      onClick={() => setRelation(relation === r ? "" : r)}
                    >
                      {r}
                    </Chip>
                  ))}
                </div>
                {isOther ? (
                  <TextInput
                    label="How are they related?"
                    value={customRelation}
                    onChange={(e) => setCustomRelation(e.target.value)}
                    placeholder="Sister"
                  />
                ) : null}
              </div>

              {/* She should know exactly what she is handing over. */}
              <div className="bg-surface-tinted border-action-primary flex flex-col gap-1 rounded-sm border p-3">
                <p className="text-body-secondary text-action-primary">
                  What they will be able to see
                </p>
                <p className="text-body-medium text-text-primary">
                  Your medicines, your readings and your documents. They cannot
                  change or delete anything.
                </p>
              </div>
            </>
          )}

          {error ? (
            <p role="alert" className="text-body-secondary text-feedback-error">
              {error}
            </p>
          ) : null}
        </div>

        {link ? (
          <div className="flex flex-col gap-3">
            <Button onClick={() => share(link, name)} className="w-full">
              <Share2 size={22} className="mr-2" aria-hidden />
              Share link
            </Button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `${name}, here is a link to see my health information on Sakha. ${link}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-default border-action-primary text-action-primary text-button-label active:bg-surface-tinted flex h-[60px] w-full items-center justify-center rounded-xl border transition-colors"
            >
              Send on WhatsApp
            </a>
            <Button variant="ghost" onClick={() => setInviting(false)} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <Button
              variant="tertiary"
              onClick={() => setInviting(false)}
              disabled={pendingAction}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={create}
              disabled={pendingAction || !name.trim() || !resolvedRelation}
              className="flex-1"
            >
              {pendingAction ? "Creating…" : "Create link"}
            </Button>
          </div>
        )}
      </Sheet>

      <Sheet
        open={confirmingRevoke !== null}
        onClose={() => setConfirmingRevoke(null)}
        title={confirmingRevoke?.name ?? ""}
      >
        <div className="bg-feedback-error-surface flex flex-col gap-1 rounded-md p-4">
          <p className="text-body-medium text-text-primary">Remove their access?</p>
          <p className="text-body-secondary text-text-secondary">
            {confirmingRevoke?.name} will no longer be able to see your
            information. You can invite them again later.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Button
            variant="tertiary"
            onClick={() => setConfirmingRevoke(null)}
            disabled={pendingAction}
            className="flex-1"
          >
            Keep access
          </Button>
          <button
            type="button"
            onClick={() => confirmingRevoke && revoke(confirmingRevoke)}
            disabled={pendingAction}
            className="bg-feedback-error text-text-on-brand text-button-label flex h-[60px] flex-1 items-center justify-center rounded-xl transition-colors disabled:opacity-60"
          >
            {pendingAction ? "Removing…" : "Revoke Access"}
          </button>
        </div>
      </Sheet>

      <Toast message={toast ?? ""} open={toast !== null} onDone={() => setToast(null)} />
    </section>
  );
}
