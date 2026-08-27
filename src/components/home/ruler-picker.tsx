"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Horizontal ruler picker — the scale from the Record designs.
 *
 * Built rather than installed: every ruler picker on npm is React Native, and
 * the web wheel pickers are a different control. This is CSS scroll-snap, so
 * the momentum and snapping are the browser's own.
 *
 * It removes the keyboard from this flow entirely, which matters more than the
 * aesthetics: nothing to mis-tap, no accessory bar covering the sheet, and a
 * value that cannot land out of range.
 *
 * The whole block is draggable, not just the tick strip — the readout sits on
 * top as a non-interactive overlay so a thumb landing anywhere in this area
 * still moves the scale. For unsteady hands a 150px target beats a 30px one.
 *
 * Operable without the gesture too: it is a real slider to assistive tech and
 * arrow keys step it, because nothing here may depend on a swipe.
 */
const TICK_GAP = 10; // px between adjacent ticks
const TRACK_HEIGHT = 150; // the full draggable area
const TICKS_TOP = 96; // where the tick strip begins inside that area

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

  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = (value - min) * TICK_GAP;
    // Mount only — after this the scroll position belongs to the user.
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
    <div className="relative w-full" style={{ height: TRACK_HEIGHT }}>
      {/* Readout. Non-interactive so drags pass straight through to the scale. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center">
        <span className="text-action-primary text-[45px] leading-[52px] font-medium">{value}</span>
        <span className="text-text-tertiary text-[16px] leading-6">{unit}</span>
      </div>

      {/* The fixed centre indicator the scale reads against. */}
      <span
        aria-hidden
        className="bg-action-primary pointer-events-none absolute left-1/2 z-10 w-[3px] -translate-x-1/2 rounded-full"
        style={{ top: TICKS_TOP - 12, height: 60 }}
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
          "absolute inset-0 flex snap-x snap-mandatory items-start overflow-x-auto outline-none",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "focus-visible:ring-action-primary rounded-md focus-visible:ring-2",
        )}
        style={{ paddingTop: TICKS_TOP, scrollBehavior: dragging ? "auto" : "smooth" }}
      >
        {/* Half-width spacers so the first and last values reach the centre. */}
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
  );
}
