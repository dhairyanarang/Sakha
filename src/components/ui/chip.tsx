"use client";

import { cn } from "@/lib/cn";

/**
 * Chip — the time-of-day selector, medicine condition tags, Documents filter.
 *
 * One size everywhere: 42px tall with 16px Regular text. The Figma library had
 * it at 46px/18px and the onboarding screens drew it at 39px/16px; this is the
 * single agreed spec and the Figma component has been updated to match.
 *
 * Horizontal padding is 20px (space/5) rather than the 18px the onboarding
 * screens used, because 18 is off the 4px grid the system mandates.
 *
 * Unselected uses control/track-disabled rather than surface/subtle: against
 * the tinted surface/page background, surface/subtle was too close to read as
 * a distinct control.
 *
 * It also carries a transparent border so selecting a chip doesn't shift the
 * row by 2px.
 */
export interface ChipProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onSelect"> {
  selected?: boolean;
}

export function Chip({ selected = false, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-[42px] shrink-0 select-none items-center justify-center rounded-full border px-5 text-[16px] leading-[1.2] font-normal transition-colors",
        selected
          ? "bg-action-primary border-action-primary text-text-on-brand"
          : "bg-control-track-disabled text-text-primary border-transparent",
        className,
      )}
      {...props}
    />
  );
}
