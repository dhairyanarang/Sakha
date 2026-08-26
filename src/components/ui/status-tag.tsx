import { cn } from "@/lib/cn";

/**
 * Status Tag — the real medicine dose indicator. Filled dot per confirmed
 * dose, outlined dot for one not yet confirmed.
 *
 * Never label an outlined dot "missed" — the only statuses are confirmed,
 * skipped and unconfirmed, and an outlined dot simply means not yet.
 */
export interface StatusTagProps extends React.ComponentPropsWithoutRef<"div"> {
  total?: number;
  confirmed: number;
  label?: string;
}

export function StatusTag({
  total = 3,
  confirmed,
  label,
  className,
  ...props
}: StatusTagProps) {
  const text = label ?? `${confirmed} of ${total} doses confirmed`;
  return (
    <div
      role="img"
      aria-label={text}
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "box-border block size-3 rounded-full",
            i < confirmed
              ? "bg-action-primary"
              : "border-action-primary border bg-transparent",
          )}
        />
      ))}
    </div>
  );
}
