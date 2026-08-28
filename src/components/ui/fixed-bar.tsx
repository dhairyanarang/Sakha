"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A bar that stays put while the document scrolls underneath it.
 *
 * position:fixed, not sticky. Sticky depends on how the browser resolves the
 * containing block and is unreliable on iOS in a flex column — it held in
 * testing here and still drifted on a real iPhone. Fixed has no such ambiguity.
 *
 * The bar leaves the flow, so a spacer takes its place. That keeps the page its
 * natural length rather than adding to it: the fixed bar removes its own height
 * from the column and the spacer puts exactly that back. A short screen stays
 * exactly one viewport tall, which is what lets it overscroll without anything
 * being padded artificially. It also means the last row of a list clears the
 * bar instead of hiding beneath it.
 *
 * `reserve` is the height the server renders the spacer at, so the first paint
 * is already correct. After mount the real height is measured and takes over,
 * which matters if she raises her system text size and the bar grows.
 *
 * The bar does NOT move for the keyboard. It sits at the bottom of the layout
 * viewport and the keyboard opens over it, so a field being typed into is never
 * covered by the footer beneath it. An earlier version lifted the bar clear of
 * the keyboard, which is right for a sheet — where Save would otherwise be
 * unreachable — and wrong for a page footer, where it just crowds the field.
 * The Sheet still lifts; see use-keyboard-inset.
 */
export function FixedBar({
  reserve,
  className,
  children,
}: {
  /** Server-rendered spacer height, in px. Measure the real bar and match it. */
  reserve: number;
  className?: string;
  children: React.ReactNode;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(reserve);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={barRef}
        style={{ bottom: 0 }}
        className={cn(
          "fixed left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2",
          className,
        )}
      >
        {children}
      </div>
      <div aria-hidden style={{ height }} />
    </>
  );
}
