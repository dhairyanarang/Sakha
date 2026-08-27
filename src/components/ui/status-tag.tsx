import { cn } from "@/lib/cn";

/**
 * Status Tag — the real medicine dose indicator. Filled dot per confirmed
 * dose, outlined dot for one not yet confirmed.
 *
 * Never label an outlined dot "missed" — the only statuses are confirmed,
 * skipped and unconfirmed, and an outlined dot simply means not yet.
 *
 * Two ways to drive it. `confirmed`/`total` fills the first n dots, which is
 * right for a plain count. `slots` gives one dot per entry in the order given
 * and fills them individually — which is what the Health screen actually
 * needs, because a medicine taken morning and evening but not afternoon reads
 * as filled/outlined/filled, and no leading-count version of this can draw
 * that. Pass one or the other; `slots` wins.
 */
export interface StatusTagProps extends React.ComponentPropsWithoutRef<"div"> {
  total?: number;
  confirmed?: number;
  /** One dot per entry, in order. True is confirmed. */
  slots?: boolean[];
  label?: string;
}

export function StatusTag({
  total = 3,
  confirmed = 0,
  slots,
  label,
  className,
  ...props
}: StatusTagProps) {
  const filled = slots ?? Array.from({ length: total }, (_, i) => i < confirmed);
  const done = filled.filter(Boolean).length;
  const text = label ?? `${done} of ${filled.length} doses confirmed`;
  return (
    <div
      role="img"
      aria-label={text}
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    >
      {filled.map((isConfirmed, i) => (
        <span
          key={i}
          className={cn(
            "box-border block size-3 rounded-full",
            isConfirmed
              ? "bg-action-primary"
              : "border-action-primary border bg-transparent",
          )}
        />
      ))}
    </div>
  );
}
