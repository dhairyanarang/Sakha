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
 * The bar rides above the keyboard. iOS shrinks the visual viewport without
 * moving the layout viewport, so a bottom-anchored fixed element would sit
 * behind the keyboard — the offset below is how much of the layout viewport the
 * keyboard covers, which keeps Next and Save reachable while typing.
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
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      // What the keyboard covers: the gap between the layout viewport and the
      // visible one. Zero whenever the keyboard is closed.
      setKeyboardInset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <>
      <div
        ref={barRef}
        style={{ bottom: keyboardInset }}
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
