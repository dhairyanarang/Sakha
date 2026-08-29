"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { useT } from "@/lib/i18n/client";

/**
 * Leaving Sakha.
 *
 * Quiet by default and confirmed before it happens. Signing out is not
 * destructive — nothing is deleted and she can come back with Google — but on
 * a phone it is one mis-tap away from a screen she may not know how to get
 * back from, and she is the least likely person to enjoy finding out.
 *
 * The confirmation happens in place rather than in a dialog over a dialog,
 * which is how removing a medicine and a document already ask. The safe
 * answer sits first and is the plainer of the two.
 *
 * A form POST rather than a fetch: /auth/signout already clears the Supabase
 * session and the active-account cookie together and redirects to Welcome, so
 * the whole thing is one server round trip with no client state to unwind.
 */
export function SignOut() {
  const t = useT();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <section className="flex shrink-0 flex-col">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-feedback-error active:bg-surface-subtle flex h-[54px] w-full items-center justify-center gap-2 rounded-xl text-[16px] leading-[1.2] font-medium transition-colors"
        >
          <LogOut size={20} aria-hidden />
          {t.profile.signOut}
        </button>
      </section>
    );
  }

  return (
    <section className="bg-feedback-error-surface flex shrink-0 flex-col gap-4 rounded-md p-4">
      <div className="flex flex-col gap-1">
        <p className="text-body-medium text-text-primary">{t.profile.signOutTitle}</p>
        <p className="text-body-secondary text-text-secondary">{t.profile.signOutBody}</p>
      </div>
      <div className="flex items-start gap-3">
        {/* The safe answer first, and the plainer of the two. */}
        <Button variant="tertiary" onClick={() => setConfirming(false)} className="flex-1">
          {t.profile.staySignedIn}
        </Button>
        {/* Not a Button variant: the library has no destructive style, and one
            local button that says what it does beats inventing a fourth. */}
        <form action="/auth/signout" method="post" className="flex-1">
          <button
            type="submit"
            className="bg-feedback-error text-text-on-brand text-button-label flex h-[60px] w-full items-center justify-center rounded-xl transition-colors"
          >
            {t.profile.signOut}
          </button>
        </form>
      </div>
    </section>
  );
}
