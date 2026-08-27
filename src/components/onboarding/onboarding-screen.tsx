import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Shared shell for the onboarding sequence, matching the Figma frames.
 *
 * Two margins are in play and that is faithful, not a mistake: the header and
 * form content sit at a 24px margin while the footer buttons sit at 16px.
 * Flagged as an inconsistency in the design rather than silently reconciled.
 *
 * Titles are 24px/Semi Bold. No text style exists at that size and weight
 * (value-display-large is 24/Medium), so it is written explicitly here.
 *
 * Colours that Figma expresses with alpha over the static page background are
 * converted to their solid equivalents, because the Design MD forbids using
 * opacity to lighten text.
 */
export function OnboardingScreen({
  backHref,
  skipHref,
  icon,
  title,
  subtitle,
  children,
  footer,
  align = "center",
}: {
  backHref?: string;
  skipHref?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
  /** Medicine has no icon and a left-aligned header, unlike the rest. */
  align?: "center" | "start";
}) {
  return (
    <div className="bg-surface-page flex h-dvh flex-col overflow-hidden">
      {/* Back sits left at a 42px tap area; Skip sits top-right. */}
      <div
        className="flex h-[42px] shrink-0 items-center justify-between px-2.5"
        style={{ marginTop: "calc(env(safe-area-inset-top) + var(--spacing-2))" }}
      >
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Go back"
            className="text-text-primary -ml-2.5 flex size-[42px] items-center justify-center"
          >
            <ChevronLeft size={24} aria-hidden />
          </Link>
        ) : (
          <span className="size-[42px]" />
        )}
        {skipHref ? (
          <Link
            href={skipHref}
            className="text-text-primary flex h-[42px] items-center px-2 text-[16px]"
          >
            Skip
          </Link>
        ) : null}
      </div>

      {/* Content scrolls; the footer never leaves the viewport. */}
      <main className="flex flex-1 flex-col overflow-y-auto pt-[34px]">
        <div
          className={cn(
            "flex w-full flex-col gap-6",
            align === "center"
              ? "mx-auto max-w-[300px] items-center px-4"
              : "items-start px-6",
          )}
        >
          {icon ? (
            /* 120px circle: brand at 10%, with the icon itself in brand. */
            <div className="text-action-primary flex items-center justify-center rounded-full bg-[rgb(85_81_255/0.1)] p-[30px]">
              {icon}
            </div>
          ) : null}
          <div
            className={cn(
              "flex w-full flex-col gap-2.5",
              align === "center" ? "text-center" : "text-left",
            )}
          >
            <h1 className="text-text-primary text-[24px] leading-[1.4] font-semibold">
              {title}
            </h1>
            {subtitle ? (
              /* rgba(0,0,0,0.4) over surface/page, resolved to a solid value. */
              <p className="text-[16px] leading-[1.4] text-[#959599]">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {children ? (
          <div className={cn("mt-[36px] flex flex-col gap-5 px-6 pb-8")}>{children}</div>
        ) : null}
      </main>

      <footer
        className="border-border-faint bg-surface-page flex shrink-0 flex-col gap-1 border-t px-4 pt-4"
        style={{ paddingBottom: "calc(var(--spacing-6) + env(safe-area-inset-bottom))" }}
      >
        {footer}
      </footer>
    </div>
  );
}
