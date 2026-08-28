"use client";

import { StatusTag } from "@/components/ui";
import { SLOT_ORDER, slotName } from "@/lib/today";
import { useI18n } from "@/lib/i18n/client";
import type { Messages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
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
function sentence(
  times: Enums<"time_of_day">[],
  t: Messages,
  locale: Locale,
): string {
  const words = SLOT_ORDER.filter((s) => times.includes(s)).map((s) =>
    // Lower-cased in English mid-sentence; Devanagari has no case to change.
    locale === "hi" ? slotName(s, locale) : slotName(s, locale).toLowerCase(),
  );
  if (words.length === 0) return t.medicines.noTimeOfDaySet;
  return t.medicines.takenAt(words);
}

export function DoseDots({
  times,
  name,
}: {
  times: Enums<"time_of_day">[];
  /** Prefixed to the label so a list of medicines stays distinguishable. */
  name?: string;
}) {
  const { t, locale } = useI18n();
  const label = sentence(times, t, locale);
  return (
    <StatusTag
      slots={SLOT_ORDER.map((s) => times.includes(s))}
      label={name ? `${name}: ${label}` : label}
    />
  );
}
