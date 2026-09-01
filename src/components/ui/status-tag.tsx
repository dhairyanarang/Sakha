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
 *
 * THE GRAMMAR, which is one grammar wherever these dots appear:
 *
 *   solid  — yes
 *   ring   — the question applies here, and the answer is no
 *   faint  — the question does not apply here
 *
 * The question itself changes by screen: Medicines asks "does she take it at
 * this time of day", the family day summary asks "was this slot confirmed".
 * What must never change is what a shape means, which is why the third state
 * exists at all — without it, "no medicine at this time" and "not confirmed"
 * would both have been a ring, and the same mark would have meant two things.
 *
 * Medicines never passes `states`, so nothing on that screen moves: a schedule
 * is only ever yes or no, and it keeps solid and ring.
 *
 * The shapes alone say none of this to a screen reader, so the group always
 * carries a written label.
 */
export type DotState = "yes" | "no" | "n/a";
export interface StatusTagProps extends React.ComponentPropsWithoutRef<"div"> {
  total?: number;
  confirmed?: number;
  /** One dot per entry, in order. True is confirmed. */
  slots?: boolean[];
  /**
   * One dot per entry, in order, with the third state available. Wins over
   * `slots`, which is the same thing without "does not apply".
   */
  states?: DotState[];
  label?: string;
}

export function StatusTag({
  total = 3,
  confirmed = 0,
  slots,
  states,
  label,
  className,
  ...props
}: StatusTagProps) {
  const filled = slots ?? Array.from({ length: total }, (_, i) => i < confirmed);
  const dots: DotState[] = states ?? filled.map((on) => (on ? "yes" : "no"));
  const done = dots.filter((d) => d === "yes").length;
  const text = label ?? `${done} of ${dots.length} doses confirmed`;
  return (
    <div
      role="img"
      aria-label={text}
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    >
      {dots.map((state, i) => (
        <span
          key={i}
          className={cn(
            "box-border block size-3 rounded-full",
            state === "yes"
              ? "bg-action-primary"
              : state === "no"
                ? "border-action-primary border bg-transparent"
                : "border-control-track-off border bg-transparent",
          )}
        />
      ))}
    </div>
  );
}
