"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { FamilyCalendar } from "./family-calendar";
import { useI18n } from "@/lib/i18n/client";

/**
 * Which day this screen is about, and the way to change it.
 *
 * It sits above everything because it governs everything below it — the
 * medicines and the measurements are both read for this date. Documents are
 * not, and deliberately: a prescription does not belong to the Tuesday
 * somebody happened to photograph it.
 *
 * Today says so in words rather than by the absence of a date. "Today, 2nd
 * September" is the same shape as "Saturday, 30th August", so changing the
 * date changes the words and never the layout.
 */
export function FamilyDateBar({
  date,
  isToday,
}: {
  /** YYYY-MM-DD, the day being shown. */
  date: string;
  isToday: boolean;
}) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);

  // Noon UTC so the label cannot slip a day either side of the date string.
  const shown = new Date(`${date}T12:00:00Z`);
  const long = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(shown);
  const weekday = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    timeZone: "UTC",
  }).format(shown);

  return (
    <>
      <section className="flex shrink-0 items-center gap-3 rounded-md bg-[rgb(85_81_255/0.08)] px-3 py-2.5">
        <CalendarDays size={24} className="text-action-primary shrink-0" aria-hidden />
        <p className="text-action-primary min-w-0 flex-1 text-[16px] leading-[1.4]">
          {isToday ? t.family.todayDate(long) : `${weekday}, ${long}`}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border-action-primary text-action-primary active:bg-surface-default flex w-[100px] shrink-0 items-center justify-center rounded-sm border px-4 py-2.5 text-center text-[16px] leading-[1.2] transition-colors"
        >
          {t.family.change}
        </button>
      </section>

      <FamilyCalendar open={open} onClose={() => setOpen(false)} selected={date} />
    </>
  );
}
