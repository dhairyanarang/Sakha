import Link from "next/link";
import { User } from "lucide-react";

/**
 * The header at the top of Home and Health.
 *
 * The text block is passed in rather than assembled here, because the two
 * screens stack it differently: Home leads with the greeting and puts her name
 * underneath in the heavier weight, Health leads with the screen name and puts
 * the description under it. Everything around the text — the mark, the
 * spacing, the avatar — is the same on both.
 *
 * The avatar is the persistent Profile slot, on every screen that has this
 * header. It shows her own photo when she has one and falls back to the mark
 * until then.
 */
export function AppHeader({
  children,
  avatarUrl,
}: {
  children: React.ReactNode;
  avatarUrl?: string | null;
}) {
  return (
    <header className="shrink-0 px-4 pb-3" style={{ paddingTop: "var(--spacing-2)" }}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/onboarding/sakha-mark.svg"
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center">{children}</div>
        <Link
          href="/profile"
          prefetch
          aria-label="Your profile"
          className="bg-action-primary text-text-on-brand flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full"
        >
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <User size={24} aria-hidden />
          )}
        </Link>
      </div>
    </header>
  );
}
