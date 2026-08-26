"use client";

import { cn } from "@/lib/cn";

/**
 * Chip — the time-of-day selector, medicine condition tags, Documents filter.
 *
 * Two sizes. `default` is the Component Library spec: 46px tall, 20px padding,
 * chip-label (18px). `compact` is what the Onboarding screens actually use:
 * 39px tall, 18px padding, 16px text. The compact size has no counterpart in
 * the Figma component library — flagged in CLAUDE.md.
 *
 * Unselected carries a transparent border so selecting a chip doesn't shift
 * the row by 2px.
 */
type ChipSize = "default" | "compact";

const SIZE: Record<ChipSize, string> = {
  default: "text-chip-label h-[46px] px-5",
  compact: "px-[18px] py-2.5 text-[16px] leading-[1.2]",
};

export interface ChipProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onSelect"> {
  selected?: boolean;
  size?: ChipSize;
}

export function Chip({
  selected = false,
  size = "default",
  className,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full border transition-colors",
        SIZE[size],
        selected
          ? "bg-action-primary border-action-primary text-text-on-brand"
          : "bg-surface-subtle text-text-primary border-transparent",
        className,
      )}
      {...props}
    />
  );
}
