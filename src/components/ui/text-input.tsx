"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Text Input — the label is ALWAYS above the field. Never placeholder-only:
 * a placeholder disappears the moment she starts typing, which is exactly when
 * she may need reminding what the field was for.
 *
 * One spec everywhere: a 14px Medium label and an 18px value in a 54px field.
 * The library previously specified a 16px value; every real screen drew 18.
 * We standardised UP rather than down — this is the text she reads back to
 * check she typed her own name correctly, and she is presbyopic.
 *
 * Focus takes the border to action/primary at 1.5px in Figma; we hold it at
 * 1px and add a 0.5px ring so focusing doesn't nudge the layout.
 */
export interface TextInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "id" | "size"> {
  label: string;
}

export function TextInput({ label, className, disabled, ...props }: TextInputProps) {
  const id = useId();
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {/* rgba(0,0,0,0.6) over surface/page, resolved to a solid value. */}
      <label htmlFor={id} className="text-[14px] leading-[1.2] font-medium text-[#636366]">
        {label}
      </label>
      <input
        id={id}
        disabled={disabled}
        className={cn(
          "h-[54px] w-full rounded-md border px-4 text-[18px] leading-[1.2] font-medium transition-shadow outline-none",
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
