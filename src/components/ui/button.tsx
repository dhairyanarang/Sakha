"use client";

import { cn } from "@/lib/cn";

/**
 * Button — 3 styles x 2 sizes x 3 states = the 18 real Figma variants.
 *
 * Full is 60px tall (NOT 64 — see CLAUDE.md) and fills its container. Figma
 * draws it at 370px, which is 402 minus two 16px margins; we take the width
 * from the parent rather than hardcoding the derived number.
 *
 * Every class below is a literal string. Tailwind scans source text, so a
 * class assembled at runtime (`active:${x}`) would never be generated.
 */

type ButtonStyleName = "primary" | "secondary" | "tertiary" | "ghost";
type ButtonSize = "full" | "compact";

const SIZE: Record<ButtonSize, string> = {
  full: "h-[60px] w-full rounded-xl",
  compact: "h-[39px] min-w-[100px] rounded-sm px-4",
};

const STYLE: Record<
  ButtonStyleName,
  { base: string; active: string; pressed: string; disabled: string }
> = {
  primary: {
    base: "bg-action-primary text-text-on-brand",
    active: "active:bg-action-primary-pressed",
    pressed: "bg-action-primary-pressed",
    disabled: "bg-action-primary-disabled text-text-on-brand",
  },
  secondary: {
    // Fill AND label darken together. A label-only shift was too quiet to
    // register at arm's length.
    base: "bg-surface-tinted text-action-primary",
    active: "active:bg-surface-tinted-strong active:text-action-primary-pressed",
    pressed: "bg-surface-tinted-strong text-action-primary-pressed",
    disabled: "bg-surface-subtle text-text-disabled",
  },
  // Not in the Figma component library, but every Onboarding screen uses it:
  // a full-height button with no fill or border, just a brand label. Flagged.
  ghost: {
    base: "bg-transparent text-action-primary",
    active: "active:text-action-primary-pressed",
    pressed: "text-action-primary-pressed",
    disabled: "text-text-disabled",
  },
  tertiary: {
    // Pressed picks up a tinted fill and darkens border and label together.
    // An outline button has little surface to work with, so the fill carries
    // the cue — area is far easier to perceive than a 1px border shift.
    base: "bg-surface-default border border-action-primary text-action-primary",
    active:
      "active:bg-surface-tinted active:border-action-primary-pressed active:text-action-primary-pressed",
    pressed:
      "bg-surface-tinted border-action-primary-pressed text-action-primary-pressed",
    disabled: "border-border-default text-text-disabled",
  },
};

export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: ButtonStyleName;
  size?: ButtonSize;
  /** Forces the pressed appearance. For documentation surfaces only. */
  pressed?: boolean;
}

export function Button({
  variant = "primary",
  size = "full",
  pressed = false,
  className,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const s = STYLE[variant];
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "text-button-label inline-flex shrink-0 select-none items-center justify-center transition-colors",
        SIZE[size],
        s.base,
        !disabled && s.active,
        !disabled && pressed && s.pressed,
        disabled && s.disabled,
        className,
      )}
      {...props}
    />
  );
}
