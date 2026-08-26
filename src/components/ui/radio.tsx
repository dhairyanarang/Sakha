"use client";

import { cn } from "@/lib/cn";

/**
 * Radio — 20x20. The selected "dot" is made by a 6px inset ring, not a nested
 * shape: white fill showing through the middle of a thick brand-coloured
 * border, leaving an 8px centre. Reproduced exactly as authored.
 *
 * Presentational only — pair with a real <input type="radio"> or role="radio"
 * on the surrounding control so it stays operable by keyboard and screen reader.
 */
export interface RadioProps extends React.ComponentPropsWithoutRef<"span"> {
  selected?: boolean;
  disabled?: boolean;
}

export function Radio({ selected = false, disabled = false, className, ...props }: RadioProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-surface-default box-border block size-5 shrink-0 rounded-full",
        selected
          ? "border-action-primary border-[6px]"
          : disabled
            ? "border-action-primary-disabled border"
            : "border-border-subtle border",
        className,
      )}
      {...props}
    />
  );
}
