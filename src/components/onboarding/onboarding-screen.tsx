import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Shared shell for the onboarding sequence.
 *
 * The sequence is deliberately short — several screens ask a single question.
 * Only name and language are actually required; family and medicines are real
 * skips, not soft-blocked ones.
 *
 * Titles are 24px/Semi Bold as authored. No text style exists at that size and
 * weight (value-display-large is 24/Medium), so it's written explicitly here
 * and flagged — it wants a real style in Figma.
 */
export function OnboardingScreen({
  backHref,
  icon,
  title,
  subtitle,
  children,
  footer,
}: {
  backHref?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="bg-surface-page flex min-h-dvh flex-col">
      <div className="h-[42px] shrink-0 px-1 pt-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Go back"
            className="text-text-primary flex size-[42px] items-center justify-center"
          >
            <ChevronLeft size={24} aria-hidden />
          </Link>
        ) : null}
      </div>

      <main className="flex flex-1 flex-col px-4 pt-6">
        {icon ? (
          <div className="bg-action-primary text-text-on-brand mx-auto flex size-[120px] items-center justify-center rounded-full">
            {icon}
          </div>
        ) : null}

        <div className={cn("flex flex-col gap-2.5", icon && "mt-6")}>
          <h1 className="text-text-primary text-center text-[24px] leading-[1.3] font-semibold">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-body-primary text-text-primary text-center">{subtitle}</p>
          ) : null}
        </div>

        {children ? <div className="mt-8 flex flex-col gap-6">{children}</div> : null}
      </main>

      <footer
        className="flex shrink-0 flex-col gap-2 px-4 pt-4"
        style={{ paddingBottom: "calc(var(--spacing-6) + env(safe-area-inset-bottom))" }}
      >
        {footer}
      </footer>
    </div>
  );
}
