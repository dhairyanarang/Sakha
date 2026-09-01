"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet } from "@/components/home/sheet";
import { localDate } from "@/lib/today";
import { useI18n } from "@/lib/i18n/client";

/**
 * Choosing a day. Nothing else happens here.
 *
 * The sheet picks a date and closes; the screen behind it becomes that day.
 * It deliberately shows nothing ABOUT a day — no marks, no summary, no
 * counts — because the screen it sits over already answers that, and a
 * calendar that also reports would be a second place to read the same thing.
 *
 * Days after today are not selectable: there is nothing to show for a day that
 * has not happened, and offering it would only produce an empty screen.
 */
const WEEKDAYS_FROM_MONDAY = [1, 2, 3, 4, 5, 6, 0];

export function FamilyCalendar({
  open,
  onClose,
  selected,
}: {
  open: boolean;
  onClose: () => void;
  /** The day currently on screen, so the sheet opens where you left it. */
  selected: string;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();

  /**
   * "This month" in HER timezone, not the reader's.
   *
   * A son abroad opening this late in the evening on the last of the month is
   * looking at a day that is already the first of the next one in Delhi. The
   * screen's data is bounded in Asia/Kolkata, so the calendar agrees with it.
   */
  const todayIST = localDate();
  const [year, setYear] = useState(Number(selected.slice(0, 4)));
  const [month, setMonth] = useState(Number(selected.slice(5, 7)));

  const currentYear = Number(todayIST.slice(0, 4));
  const currentMonth = Number(todayIST.slice(5, 7));

  const monthLabel = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 15)));

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // Monday-first, which is how a week reads in India.
  const leading = WEEKDAYS_FROM_MONDAY.indexOf(
    new Date(Date.UTC(year, month - 1, 1)).getUTCDay(),
  );
  const pad = (n: number) => String(n).padStart(2, "0");

  function step(by: number) {
    let y = year;
    let m = month + by;
    if (m < 1) { y -= 1; m = 12; }
    else if (m > 12) { y += 1; m = 1; }
    setYear(y);
    setMonth(m);
  }

  function choose(date: string) {
    onClose();
    // Today drops the parameter entirely, so the plain URL is always today.
    router.push(date === todayIST ? "/" : `/?d=${date}`);
  }

  return (
    <Sheet open={open} onClose={onClose} title={t.family.chooseDay}>
      <div className="flex flex-col gap-4">
        <div className="flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={t.family.previousMonth}
            className="text-text-primary active:bg-surface-tinted flex size-[42px] items-center justify-center rounded-full"
          >
            <ChevronLeft size={22} aria-hidden />
          </button>
          <p className="text-text-primary text-[18px] leading-[1.2] font-medium">
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={t.family.nextMonth}
            disabled={year === currentYear && month === currentMonth}
            className="text-text-primary active:bg-surface-tinted flex size-[42px] items-center justify-center rounded-full disabled:opacity-30"
          >
            <ChevronRight size={22} aria-hidden />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {t.family.weekdayInitials.map((w, i) => (
            <div
              key={i}
              className="text-text-secondary flex h-7 items-center justify-center text-[13px]"
            >
              {w}
            </div>
          ))}
          {Array.from({ length: leading }).map((_, i) => (
            <div key={`x${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = `${year}-${pad(month)}-${pad(i + 1)}`;
            const future = date > todayIST;
            const isSelected = date === selected;
            const isToday = date === todayIST;
            return (
              <button
                key={date}
                type="button"
                disabled={future}
                onClick={() => choose(date)}
                aria-current={isSelected ? "date" : undefined}
                aria-label={`${i + 1} ${monthLabel}`}
                /* 44px: a date is a tap target like any other. */
                className={
                  "flex h-11 items-center justify-center rounded-lg text-[16px] transition-colors " +
                  (isSelected
                    ? "bg-action-primary text-text-on-brand font-medium"
                    : isToday
                      ? "bg-surface-tinted text-action-primary font-medium"
                      : future
                        ? "text-text-disabled"
                        : "text-text-primary active:bg-surface-tinted")
                }
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
