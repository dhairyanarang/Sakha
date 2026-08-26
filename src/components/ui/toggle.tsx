"use client";

import { cn } from "@/lib/cn";

/** Toggle — 54x28 track, 24x24 white thumb, 2px inset. */
export interface ToggleProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Toggle({
  checked = false,
  onCheckedChange,
  disabled,
  className,
  type = "button",
  ...props
}: ToggleProps) {
  return (
    <button
      type={type}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "inline-flex h-[28px] w-[54px] shrink-0 items-center rounded-full p-[2px] transition-colors",
        disabled
          ? "bg-action-primary-disabled"
          : checked
            ? "bg-action-primary"
            : // No semantic token exists for the off track; Figma binds neutral/300.
            "bg-[var(--neutral-300)]",
        checked ? "justify-end" : "justify-start",
        className,
      )}
      {...props}
    >
      <span className="bg-surface-default block size-6 rounded-full transition-transform" />
    </button>
  );
}
