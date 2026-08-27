import { cn } from "@/lib/cn";

/**
 * Status Tag — the medicine dose indicator.
 *
 * In the product this renders a medicine's daily schedule: three dots reading
 * morning, afternoon, evening, filled where she takes it. See DoseDots, which
 * is the only thing that should build one for a medicine.
 *
 * An empty dot means "not taken at this time of day". It is NOT a missed dose
 * — "missed" is not a state this product has at all.
 *
 * Two ways to drive it. `slots` gives one dot per entry, in order, filled
 * individually — required here, because position carries the meaning and
 * morning-and-evening must read filled/empty/filled rather than collapsing to
 * two adjacent dots. `confirmed`/`total` fills the first n instead, which suits
 * a plain count and is what the kitchen sink demonstrates. `slots` wins.
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
