"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet } from "@/components/home/sheet";
import { loadCareMonth } from "@/app/actions/care-history";
import type { CareDay } from "@/lib/care-history";
import { localDate } from "@/lib/today";
import { useT, useLocale } from "@/lib/i18n/client";

/**
 * Choosing a day to look at. Nothing more than that.
 *
 * It used to answer the question as well as ask it — the day's medicines and
 * readings were listed inside the sheet, which put the interesting content in
 * a panel you had to hold open, on top of the screen it was about. Now picking
 * a date closes the sheet and Home becomes that day. One place shows care, and
 * it is the same place whether the day is today or not.
 *
 * The marks stay, because choosing is easier when you can see which days have
 * something on them. Three states and no more: filled where every dose was
 * confirmed, a ring where some were answered but not all confirmed, a faint
 * ring where medicines were due and nothing was answered. A day with no
 * medicines gets nothing.
 *
 * Deliberately not red and green, and not a grid of them. An unanswered dose
 * is not a failure — she may simply not have opened the app — and a month of
 * red squares would say something about her the data does not support.
 */
const WEEKDAYS_FROM_MONDAY = [1, 2, 3, 4, 5, 6, 0];

type DayMark = "none" | "confirmed" | "partial" | "unanswered";

function markFor(day: CareDay | undefined): DayMark {
  if (!day || day.doses.length === 0) return "none";
  if (day.doses.every((d) => d.status === "confirmed")) return "confirmed";
  return day.doses.some((d) => d.status !== "unconfirmed") ? "partial" : "unanswered";
}

export function CareHistory({
  accountId,
  selected: viewing,
}: {
  accountId: string;
  /** The day Home is already showing, so reopening lands on it. */
  selected?: string;
}) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  /**
   * "This month" in HER timezone, not the reader's.
   *
   * A son in London opening this in the evening on the last of the month is
   * looking at a day that is already the first of the next one in Delhi. The
   * server decides which days exist in Asia/Kolkata, so the calendar has to
   * agree with it about what month we are in.
   */
  const todayIST = localDate();
  const currentYear = Number(todayIST.slice(0, 4));
  const currentMonth = Number(todayIST.slice(5, 7));

  // Opens on the month being viewed, when there is one.
  const [year, setYear] = useState(viewing ? Number(viewing.slice(0, 4)) : currentYear);
  const [month, setMonth] = useState(viewing ? Number(viewing.slice(5, 7)) : currentMonth);
  const [days, setDays] = useState<CareDay[] | null>(null);
  const [pending, startTransition] = useTransition();

  /**
   * One fetch per month, on open and on each month change.
   *
   * Driven from the handlers rather than an effect: the effect version had to
   * read `open` and the month back out of state to decide whether to run,
   * which is the shape that makes a fetch fire twice and a stale month win.
   */
  function fetchMonth(y: number, m: number) {
    setDays(null);
    startTransition(async () => {
      setDays(await loadCareMonth(accountId, y, m));
    });
  }

  function choose(date: string) {
    setOpen(false);
    router.push(`/?d=${date}`);
  }

  const monthLabel = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(Date.UTC(year, month - 1, 15)));

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // Monday-first, which is how a week reads in India.
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const leading = WEEKDAYS_FROM_MONDAY.indexOf(firstWeekday);

  const byDate = new Map((days ?? []).map((d) => [d.date, d]));
  const pad = (n: number) => String(n).padStart(2, "0");

  function step(by: number) {
    let y = year;
    let m = month + by;
    if (m < 1) {
      y -= 1;
      m = 12;
    } else if (m > 12) {
      y += 1;
      m = 1;
    }
    setYear(y);
    setMonth(m);
    fetchMonth(y, m);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          fetchMonth(year, month);
        }}
        aria-label={t.family.careHistory}
        className="text-action-primary active:bg-surface-tinted -mr-2 flex size-[42px] shrink-0 items-center justify-center rounded-full transition-colors"
      >
        <CalendarDays size={22} aria-hidden />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={t.family.pickADay}>
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
              // Nothing to see in a month that has not happened.
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
              const lived = byDate.has(date);
              const isViewing = viewing === date;
              const mark = markFor(byDate.get(date));
              return (
                <button
                  key={date}
                  type="button"
                  disabled={!lived}
                  onClick={() => choose(date)}
                  aria-current={isViewing ? "date" : undefined}
                  /* The dot is decoration; the state is said in words here, so
                     nothing depends on seeing a 5px shape. */
                  aria-label={`${i + 1} ${monthLabel}${
                    mark === "none" ? "" : ` — ${t.family.dayMark[mark]}`
                  }`}
                  /* 44px tall: a date is a tap target like any other. */
                  className={
                    "flex h-11 flex-col items-center justify-center gap-[3px] rounded-lg text-[16px] transition-colors " +
                    (isViewing
                      ? "bg-action-primary text-text-on-brand font-medium"
                      : lived
                        ? "text-text-primary active:bg-surface-tinted"
                        : "text-text-disabled")
                  }
                >
                  <span className="leading-none">{i + 1}</span>
                  {/* Holds its place whether or not there is a mark, so the
                      numbers sit on one line across the whole month. */}
                  <span
                    aria-hidden
                    className={
                      "block size-[5px] rounded-full border " +
                      (mark === "none"
                        ? "border-transparent"
                        : isViewing
                          ? mark === "confirmed"
                            ? "border-text-on-brand bg-text-on-brand"
                            : "border-text-on-brand"
                          : mark === "confirmed"
                            ? "border-action-primary bg-action-primary"
                            : mark === "partial"
                              ? "border-action-primary"
                              : "border-control-track-off")
                    }
                  />
                </button>
              );
            })}
          </div>

          {pending && !days ? (
            <p className="text-text-secondary shrink-0 text-[16px]">
              {t.family.loadingMonth}
            </p>
          ) : null}
        </div>
      </Sheet>
    </>
  );
}
