"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { acceptInvitation } from "@/app/invite/actions";
import { useT } from "@/lib/i18n/client";

/**
 * Accept or decline.
 *
 * Declining does not tell the inviter anything or burn the link — it simply
 * leaves. Someone who taps it by mistake can open the link again, and someone
 * who genuinely does not want access should not have to explain themselves.
 */
export function AcceptInvitation({
  token,
  inviter,
}: {
  token: string;
  inviter: string;
}) {
  const router = useRouter();
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function accept() {
    setError(null);
    startTransition(async () => {
      const err = await acceptInvitation(token);
      if (err) setError(err);
    });
  }

  return (
    <footer
      className="flex shrink-0 flex-col gap-3 px-4"
      style={{ paddingBottom: "var(--spacing-7)" }}
    >
      {error ? (
        <p role="alert" className="text-body-secondary text-feedback-error text-center">
          {error}
        </p>
      ) : null}
      <Button onClick={accept} disabled={pending} className="w-full">
        {pending ? t.invitations.opening : t.invitations.seeTheirInformation(inviter)}
      </Button>
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        disabled={pending}
        className="w-full"
      >
        {t.onboarding.notNow}
      </Button>
    </footer>
  );
}
