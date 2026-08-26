"use client";

import { cn } from "@/lib/cn";

/**
 * Chip — the time-of-day selector, medicine condition tags, Documents filter.
 * 46px tall, fully rounded.
 *
 * Unselected carries a transparent 1px border so selecting a chip doesn't
 * shift layout by 2px — Figma's two variants differ in width for that reason.
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
        "text-chip-label inline-flex h-[46px] shrink-0 select-none items-center justify-center rounded-full border px-5 transition-colors",
        selected
          ? "bg-action-primary border-action-primary text-text-on-brand"
          : "bg-surface-subtle text-text-primary border-transparent",
        className,
      )}
      {...props}
    />
  );
}
