"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Text Input — the label is ALWAYS above the field. Never placeholder-only:
 * a placeholder disappears the moment she starts typing, which is exactly when
 * she may need reminding what the field was for.
 *
 * Two sizes. `default` matches the Component Library: label body-secondary in
 * text/secondary, value body-primary (16px). `lg` matches what every real
 * Onboarding screen uses: label 14px Medium and an 18px Medium value. The lg
 * treatment has no counterpart in the Figma component library — flagged.
 *
 * Focus takes the border to action/primary at 1.5px in Figma; we hold it at
 * 1px and add a 0.5px ring so focusing doesn't nudge the layout.
 */
type InputSize = "default" | "lg";

export interface TextInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "id" | "size"> {
  label: string;
  size?: InputSize;
}

export function TextInput({
  label,
  size = "default",
  className,
  disabled,
  ...props
}: TextInputProps) {
  const id = useId();
  const lg = size === "lg";

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className={cn(
          lg
            ? "text-[14px] leading-[1.2] font-medium text-[#636366]"
            : "text-body-secondary text-text-secondary",
        )}
      >
        {label}
      </label>
      <input
        id={id}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border transition-shadow outline-none",
          lg
            ? "text-[18px] leading-[1.2] font-medium p-4"
            : "text-body-primary h-[54px] px-4",
          "placeholder:text-text-tertiary placeholder:font-normal",
          disabled
            ? "bg-surface-subtle border-border-default text-text-disabled"
            : [
                "bg-surface-default border-border-default text-text-primary",
                "focus:border-action-primary focus:shadow-[0_0_0_0.5px_var(--color-action-primary)]",
              ],
        )}
        {...props}
      />
    </div>
  );
}
