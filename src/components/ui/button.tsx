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

type ButtonStyleName = "primary" | "secondary" | "tertiary";
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
    // Pressed darkens the LABEL to brand/700, not the fill. No semantic token
    // exists for that value — see the open issues in CLAUDE.md.
    base: "bg-surface-tinted text-action-primary",
    active: "active:text-[var(--brand-700)]",
    pressed: "text-[var(--brand-700)]",
    // Figma uses the neutral/100 primitive; surface/subtle aliases it.
    disabled: "bg-surface-subtle text-text-disabled",
  },
  tertiary: {
    base: "bg-surface-default border border-action-primary text-action-primary",
    // NOTE: Figma's Tertiary/Pressed is visually identical to Default — neither
    // the fill nor the label darkens. Reproduced faithfully, but flagged: this
    // button currently gives no tap feedback at all.
    active: "",
    pressed: "",
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
