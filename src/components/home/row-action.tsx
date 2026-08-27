"use client";

import { cn } from "@/lib/cn";

/**
 * The small action on a today's-care row — Confirm, Record, Log Walk.
 *
 * NOT the Button component: these are 100x43 with 16px Regular text, where the
 * library's compact button is 100x39 with 18px Medium. A third button size
 * that doesn't exist in the Figma component library — flagged rather than
 * forced into the closest variant, since at this size the difference shows.
 */
export function RowAction({
  tone = "primary",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { tone?: "primary" | "tinted" }) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-[100px] shrink-0 items-center justify-center rounded-sm px-4 py-3 text-center text-[16px] leading-[1.2] transition-colors disabled:opacity-60",
        tone === "primary"
          ? "bg-action-primary text-text-on-brand active:bg-action-primary-pressed"
          : "bg-surface-tinted-strong text-action-primary active:text-action-primary-pressed",
        className,
      )}
      {...props}
    />
  );
}
