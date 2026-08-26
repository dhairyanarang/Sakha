"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Settings Row — icon, label/subtitle column, trailing control.
 *
 * Control=Chevron uses a real lucide chevron-right, matching Figma.
 */
export interface SettingsRowProps extends React.ComponentPropsWithoutRef<"div"> {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  control?: React.ReactNode;
}

export function SettingsRow({
  icon,
  label,
  subtitle,
  control,
  className,
  ...props
}: SettingsRowProps) {
  return (
    <div className={cn("flex w-full items-center gap-4", className)} {...props}>
      <span className="text-text-primary flex size-[22px] shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body-medium text-text-primary truncate">{label}</span>
        {subtitle ? (
          <span className="text-body-secondary text-text-secondary truncate">{subtitle}</span>
        ) : null}
      </span>
      {control ?? <ChevronRight size={20} className="text-text-tertiary shrink-0" />}
    </div>
  );
}
