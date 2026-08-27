"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Horizontal ruler picker — the scale from the Record Sugar design.
 *
 * Built rather than installed: every ruler picker on npm is React Native, and
 * the web wheel pickers are a different control entirely. This is CSS
 * scroll-snap, so the momentum and snapping are the browser's own.
 *
 * It also removes the keyboard from this flow completely, which matters more
 * than the aesthetics: no keypad to mis-hit, no accessory bar covering the
 * sheet, and a value that can only ever land in range.
 *
 * Operable without the gesture too — it is a real slider to assistive tech,
 * and arrow keys step it — because nothing here may depend on a swipe.
 */
const TICK_GAP = 10; // px between adjacent ticks

export function RulerPicker({
  value,
  onChange,
  min,
  max,
  unit,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit: string;
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const settling = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragging, setDragging] = useState(false);

  const count = max - min + 1;

  // Centre the starting value once the track has a width to measure.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollLeft = (value - min) * TICK_GAP;
    // Only on mount: afterwards the scroll position is the user's business.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    setDragging(true);
    const next = Math.min(max, Math.max(min, min + Math.round(el.scrollLeft / TICK_GAP)));
    if (next !== value) onChange(next);
    if (settling.current) clearTimeout(settling.current);
    settling.current = setTimeout(() => setDragging(false), 140);
  }

  function step(delta: number) {
    const next = Math.min(max, Math.max(min, value + delta));
    onChange(next);
    if (trackRef.current) trackRef.current.scrollLeft = (next - min) * TICK_GAP;
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <p aria-hidden className="text-action-primary text-[45px] leading-[52px] font-medium">
        {value}
      </p>
      <p aria-hidden className="text-text-tertiary text-[16px] leading-6">
        {unit}
      </p>

      <div className="relative mt-2 w-full">
        {/* The centre indicator the scale reads against. */}
        <span
          aria-hidden
          className="bg-action-primary absolute top-0 left-1/2 z-10 h-[44px] w-[2px] -translate-x-1/2 rounded-full"
        />
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value} ${unit}`}
          onScroll={handleScroll}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); step(-1); }
            if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); step(1); }
            if (e.key === "PageDown") { e.preventDefault(); step(-10); }
            if (e.key === "PageUp") { e.preventDefault(); step(10); }
          }}
          className={cn(
            "flex snap-x snap-mandatory items-start overflow-x-auto pt-[14px] outline-none",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "focus-visible:ring-action-primary rounded-md focus-visible:ring-2",
          )}
          style={{ scrollBehavior: dragging ? "auto" : "smooth" }}
        >
          {/* Half-width spacers so the first and last values can reach the centre. */}
          <span aria-hidden className="shrink-0" style={{ width: "calc(50% - 1px)" }} />
          {Array.from({ length: count }, (_, i) => {
            const v = min + i;
            const major = v % 10 === 0;
            return (
              <span
                key={v}
                aria-hidden
                className="flex shrink-0 snap-center justify-center"
                style={{ width: TICK_GAP }}
              >
                <span
                  className={cn(
                    "w-[2px] rounded-full",
                    major ? "bg-text-primary h-[30px]" : "bg-border-default h-[16px]",
                  )}
                />
              </span>
            );
          })}
          <span aria-hidden className="shrink-0" style={{ width: "calc(50% - 1px)" }} />
        </div>
      </div>
    </div>
  );
}
