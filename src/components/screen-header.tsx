import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * The header on a pushed screen: back, title, and an optional action.
 *
 * White rather than the page colour, with a border/soft hairline under it, as
 * drawn on Medicines. Figma measures the bar at 121px from the top of the
 * frame, but that includes the iOS status bar — the app shell already sits
 * below it, so what is reproduced here is the 62px of actual bar.
 *
 * The back chevron is 24px inside a 42px tap area. That is the one sanctioned
 * exception to the 20-22px icon rule, because it is a primary navigation
 * action (see CLAUDE.md).
 */
export function ScreenHeader({
  backHref,
  title,
  action,
}: {
  backHref: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      {/* Fixed, not sticky: going back is a persistent control and must stay
          reachable however far down the list she is. Its height is a constant,
          so the spacer below needs no measuring and this stays a server
          component. */}
      <header className="bg-surface-default border-border-soft fixed top-0 left-1/2 z-30 flex h-[62px] w-full max-w-[430px] -translate-x-1/2 items-center justify-between border-b-[0.5px] px-2.5">
        <div className="flex min-w-0 items-center gap-1">
          <Link
            href={backHref}
            prefetch
            aria-label="Go back"
            className="text-text-primary flex size-[42px] shrink-0 items-center justify-center"
          >
            <ChevronLeft size={24} aria-hidden />
          </Link>
          <h1 className="text-screen-title text-text-primary truncate">{title}</h1>
        </div>
        {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
      </header>
      {/* Holds the bar's place, so the page keeps its natural length. */}
      <div aria-hidden className="h-[62px] shrink-0" />
    </>
  );
}
