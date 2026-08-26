"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Text Input — the label is ALWAYS above the field. Never placeholder-only:
 * a placeholder disappears the moment she starts typing, which is exactly when
 * she may need reminding what the field was for.
 *
 * Field is 54px tall, radius/md. Focus takes the border to action/primary at
 * 1.5px in Figma; we hold the border at 1px and add a 0.5px ring so focusing
 * doesn't nudge the layout.
 */
export interface TextInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "id"> {
  label: string;
}

export function TextInput({ label, className, disabled, ...props }: TextInputProps) {
  const id = useId();
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <label htmlFor={id} className="text-body-secondary text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        disabled={disabled}
        className={cn(
          "text-body-primary h-[54px] w-full rounded-md border px-4 transition-shadow outline-none",
          "placeholder:text-text-tertiary",
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
