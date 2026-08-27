import { StatusTag } from "@/components/ui";
import { SLOT_ORDER } from "@/lib/today";
import type { Enums } from "@/lib/supabase/types";

/**
 * The three dots beside a medicine.
 *
 * There are ALWAYS three, and they always read morning, afternoon, evening in
 * that order. A filled dot means she takes this medicine at that time of day;
 * an empty one means she does not. They describe the schedule she set up, not
 * what she has confirmed today — Home is where today's state lives.
 *
 * Because position carries the meaning, the count of filled dots is never the
 * point: morning-and-evening is filled, empty, filled, and must not collapse
 * to two dots in a row.
 *
 * Colour and fill alone would say nothing to a screen reader, so the whole
 * group carries a written label instead.
 */
const SLOT_WORD: Record<Enums<"time_of_day">, string> = {
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
};

function sentence(times: Enums<"time_of_day">[]): string {
  const words = SLOT_ORDER.filter((s) => times.includes(s)).map((s) => SLOT_WORD[s]);
  if (words.length === 0) return "No time of day set";
  if (words.length === 1) return `Taken in the ${words[0]}`;
  const last = words[words.length - 1];
  return `Taken in the ${words.slice(0, -1).join(", ")} and ${last}`;
}

export function DoseDots({
  times,
  name,
}: {
  times: Enums<"time_of_day">[];
  /** Prefixed to the label so a list of medicines stays distinguishable. */
  name?: string;
}) {
  const label = sentence(times);
  return (
    <StatusTag
      slots={SLOT_ORDER.map((s) => times.includes(s))}
      label={name ? `${name}: ${label}` : label}
    />
  );
}
