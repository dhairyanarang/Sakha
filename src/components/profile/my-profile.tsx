"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronRight, Mail, PenLine, User } from "lucide-react";
import { Sheet } from "@/components/home/sheet";
import { Button, TextInput, Toast } from "@/components/ui";
import { removeAvatar, updateDisplayName, uploadAvatar } from "@/app/profile/actions";
import type { ProfileView } from "@/lib/profile-data";

/**
 * My Profile — her photo, her name, and the account she signed in with.
 *
 * The frames also show Age and Phone Number. Both were dropped on the user's
 * instruction: neither exists in the data model, and the product does not ask
 * for anything it has no use for.
 *
 * Email is shown but not editable. It is the Google account she signs in with,
 * so changing it here would either be a lie or a second identity to keep in
 * step — it has no chevron, which is how the row says so.
 *
 * The photo falls back to her Google picture until she picks her own. The pen
 * badge is the only control; once she has her own, the sheet also offers going
 * back to the Google one.
 */
export function MyProfile({ profile }: { profile: ProfileView }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(profile.displayName);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.set("file", file);
    startTransition(async () => {
      const err = await uploadAvatar(data);
      setToast(err ?? "Photo updated.");
    });
  }

  function useGooglePhoto() {
    startTransition(async () => {
      const err = await removeAvatar();
      setToast(err ?? "Using your Google photo.");
    });
  }

  function saveName() {
    setError(null);
    startTransition(async () => {
      const err = await updateDisplayName(name);
      if (err) setError(err);
      else {
        setEditingName(false);
        setToast("Name updated.");
      }
    });
  }

  return (
    <>
      <main className="flex flex-1 flex-col gap-6 px-4 pt-6 pb-4">
        <div className="flex shrink-0 flex-col items-center gap-3">
          <div className="relative size-[120px]">
            <span className="bg-surface-tinted flex size-[120px] items-center justify-center overflow-hidden rounded-full">
              {profile.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                <User size={60} className="text-action-primary" aria-hidden />
              )}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={pickPhoto}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={pending}
              aria-label="Change your photo"
              className="bg-action-primary border-surface-page text-text-on-brand absolute right-0 bottom-0 flex size-[36px] items-center justify-center rounded-full border"
            >
              <PenLine size={18} aria-hidden />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="text-text-primary text-[20px] leading-[1.2] font-medium">You</p>
            {profile.hasOwnPhoto ? (
              <button
                type="button"
                onClick={useGooglePhoto}
                disabled={pending}
                className="text-action-primary text-[14px] leading-[1.2]"
              >
                Use my Google photo
              </button>
            ) : null}
          </div>
        </div>

        <div className="bg-surface-default border-border-soft flex shrink-0 flex-col gap-4 rounded-xl border-[0.5px] px-4 py-4">
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="active:bg-surface-tinted -mx-2 flex items-center gap-4 rounded-md px-2 py-1 text-left transition-colors"
          >
            <span className="bg-surface-tinted flex size-[44px] shrink-0 items-center justify-center rounded-full">
              <User size={22} className="text-action-primary" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              {/* rgba(0,0,0,0.4) over surface/default, resolved to a solid. */}
              <span className="text-[14px] leading-[1.2] text-[#999999]">Full Name</span>
              <span className="text-text-primary truncate text-[16px] leading-[1.2]">
                {profile.displayName}
              </span>
            </span>
            <ChevronRight size={20} className="text-text-tertiary shrink-0" aria-hidden />
          </button>

          <div className="border-border-default ml-[54px] border-t" />

          <div className="flex items-center gap-4 px-0 py-1">
            <span className="bg-surface-tinted flex size-[44px] shrink-0 items-center justify-center rounded-full">
              <Mail size={22} className="text-action-primary" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-[14px] leading-[1.2] text-[#999999]">Email ID</span>
              <span className="text-text-primary truncate text-[16px] leading-[1.2]">
                {profile.email ?? "—"}
              </span>
            </span>
          </div>
        </div>
      </main>

      <Sheet
        open={editingName}
        onClose={() => setEditingName(false)}
        title="Your Name"
      >
        <div className="flex flex-col gap-6">
          <TextInput
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Asha Sharma"
            autoComplete="name"
          />
          {error ? (
            <p role="alert" className="text-body-secondary text-feedback-error">
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex items-start gap-3">
          <Button
            variant="tertiary"
            onClick={() => setEditingName(false)}
            disabled={pending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={saveName} disabled={pending} className="flex-1">
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </Sheet>

      <Toast message={toast ?? ""} open={toast !== null} onDone={() => setToast(null)} />
    </>
  );
}
