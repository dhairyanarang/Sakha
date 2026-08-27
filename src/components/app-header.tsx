import { User } from "lucide-react";
import { greeting, longDate } from "@/lib/today";

/**
 * The greeting header, shared by Home and Health.
 *
 * Both screens draw it identically in Figma, so it lives here rather than
 * being copied. The avatar is the persistent Profile slot — Profile itself
 * lands in Phase 6, so this is the placeholder that holds its position and
 * size rather than a working link.
 */
export function AppHeader({ name }: { name: string }) {
  return (
    <header className="shrink-0 px-4 pb-4" style={{ paddingTop: "var(--spacing-3)" }}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/onboarding/sakha-mark.svg"
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <p className="text-action-primary truncate text-[20px] leading-[1.2] font-medium">
            {greeting()}, {name}
          </p>
          <p className="text-action-primary text-[14px] leading-[1.2]">{longDate()}</p>
        </div>
        <span
          title="Profile"
          className="bg-action-primary text-text-on-brand flex size-[52px] shrink-0 items-center justify-center rounded-full"
        >
          <User size={24} aria-hidden />
        </span>
      </div>
    </header>
  );
}
