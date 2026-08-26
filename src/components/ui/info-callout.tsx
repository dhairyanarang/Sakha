import { cn } from "@/lib/cn";

/**
 * Info Callout — factual reference content. The BP typical-range note, the
 * onboarding privacy line, the reminders permission note.
 *
 * Uses the brand colour but is NOT interactive. That collision is a known,
 * accepted trade-off, not an oversight.
 *
 * Figma carries a 1px action/primary border that the Design MD doesn't mention;
 * Figma is the source of truth, so the border stays.
 */
export interface InfoCalloutProps extends React.ComponentPropsWithoutRef<"div"> {
  label?: string;
}

export function InfoCallout({ label, className, children, ...props }: InfoCalloutProps) {
  return (
    <div
      className={cn(
        "bg-surface-tinted border-action-primary flex w-full flex-col gap-3 rounded-sm border px-3 py-2",
        className,
      )}
      {...props}
    >
      {label ? (
        <span className="text-body-secondary text-action-primary">{label}</span>
      ) : null}
      {children ? (
        <span className="text-body-medium text-text-primary">{children}</span>
      ) : null}
    </div>
  );
}
