"use client";

import { useState, useTransition } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet } from "@/components/home/sheet";
import { loadCareMonth } from "@/app/actions/care-history";
import type { CareDay } from "@/lib/care-history";
import { localDate, slotName } from "@/lib/today";
import { useT, useLocale } from "@/lib/i18n/client";

/**
 * Looking back at a day that has already happened.
 *
 * Recent Updates answers "what has been going on", but it is a feed: eight
 * rows, newest first, so the moment today fills up, yesterday falls off the
 * bottom. That is right for a feed and useless for the question a son actually
 * asks on a Sunday — "how did last week go".
 *
 * So this is a calendar, and nothing more than a calendar. Pick a day, see
 * that day. There is no streak, no score, no percentage and no colour-coded
 * month: a grid of red squares is exactly the manufactured alarm this product
 * exists to avoid, and it would be reading a judgement into an unconfirmed
 * dose that the data does not support. A dose is confirmed, skipped, or simply
 * not answered — and the last of those is not a failure.
 *
 * Every status shown here is computed by the same rule as the owner's own
 * Home. Nothing about a past day is stored anywhere.
 */
const WEEKDAYS_FROM_MONDAY = [1, 2, 3, 4, 5, 6, 0];

/**
 * One mark per day, from the same statuses the detail panel spells out.
 *
 * Three states and no more. A filled dot is a day where every dose was
 * confirmed; a ring is a day where some were answered but not all confirmed;
 * a faint ring is a day with medicines due and nothing answered at all. A day
 * with no medicines gets nothing, because there is nothing to say about it.
 *
 * Deliberately not red and green, and deliberately not a grid of them. An
 * unanswered dose is not a failure — she may simply not have opened the app —
 * and a month of red squares would say something about her that the data does
 * not support. The difference here is shape first and colour second, so it
 * survives being read by someone who cannot separate the two, and every cell
 * carries the same thing in words on its aria-label.
 *
 * Which of skipped and unconfirmed a day holds is left to the detail panel.
 * At month scale the useful question is "was that day answered", and the
 * honest answer to a finer one is a tap away.
 */
type DayMark = "none" | "confirmed" | "partial" | "unanswered";

function markFor(day: CareDay | undefined): DayMark {
  if (!day || day.doses.length === 0) return "none";
  if (day.doses.every((d) => d.status === "confirmed")) return "confirmed";
  return day.doses.some((d) => d.status !== "unconfirmed") ? "partial" : "unanswered";
}

export function CareHistory({ accountId }: { accountId: string }) {
  const t = useT();
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  /**
   * "This month" in HER timezone, not the reader's.
   *
   * A son in London opening this at half past seven in the evening on the last
   * of the month is looking at a day that is already the first of the next one
   * in Delhi. The server decides which days exist in Asia/Kolkata, so the
   * calendar has to agree with it about what month we are in, or the bounds
   * disagree with the data by a day.
   */
  const todayIST = localDate();
  const currentYear = Number(todayIST.slice(0, 4));
  const currentMonth = Number(todayIST.slice(5, 7));

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [days, setDays] = useState<CareDay[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  /**
   * One fetch per month — on open, and on each month change. Tapping a date
   * costs nothing after that, because the month is already here.
   *
   * Driven from the handlers rather than an effect. The effect version had to
   * read `open` and the month back out of state to decide whether to run,
   * which is the shape that makes a fetch fire twice and a stale month win.
   * Here the fetch happens because a person did something, and the month it is
   * for is the argument.
   */
  function fetchMonth(y: number, m: number, keepSelection = false) {
    setDays(null);
    if (!keepSelection) setSelected(null);
    startTransition(async () => {
      const result = await loadCareMonth(accountId, y, m);
      setDays(result);
      // Land on the most recent day that actually has something on it, so the
      // sheet opens showing something rather than asking him to hunt.
      setSelected((prev) => prev ?? result[result.length - 1]?.date ?? null);
    });
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
  const day = selected ? byDate.get(selected) : undefined;

  function step(by: number) {
    let y = year;
    let m = month + by;
    if (m < 1) { y -= 1; m = 12; }
    else if (m > 12) { y += 1; m = 1; }
    setYear(y);
    setMonth(m);
    fetchMonth(y, m);
  }

  return (
    <>
      {/* Subtle on purpose: this sits beside the Recent Updates heading, not
          above the feed as a second call to action. It is a way back through
          what is already on screen, not a new place to go. */}
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          fetchMonth(year, month, true);
        }}
        aria-label={t.family.careHistory}
        className="text-action-primary active:bg-surface-tinted -mr-2 flex size-[42px] shrink-0 items-center justify-center rounded-full transition-colors"
      >
        <CalendarDays size={22} aria-hidden />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={t.family.careHistory}>
        <div className="flex flex-col gap-4">
          {/* Month, and a way either side of it. */}
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
              const isSelected = selected === date;
              const mark = markFor(byDate.get(date));
              return (
                <button
                  key={date}
                  type="button"
                  disabled={!lived}
                  onClick={() => setSelected(date)}
                  aria-pressed={isSelected}
                  /* The dot is decoration; the state is said in words here, so
                     nothing depends on seeing a 5px shape or telling two
                     colours apart. */
                  aria-label={`${i + 1} ${monthLabel}${
                    mark === "none" ? "" : ` — ${t.family.dayMark[mark]}`
                  }`}
                  /* 44px tall: a date is a tap target like any other. */
                  className={
                    "flex h-11 flex-col items-center justify-center gap-[3px] rounded-lg text-[16px] transition-colors " +
                    (isSelected
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
                        : isSelected
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

          {/* The chosen day. */}
          <div className="border-border-soft flex min-h-[132px] flex-col gap-3 border-t-[0.5px] pt-4">
            {pending && !days ? (
              <p className="text-text-secondary text-[16px]">{t.family.loadingMonth}</p>
            ) : !day ? (
              <p className="text-text-secondary text-[16px]">{t.family.pickADay}</p>
            ) : (
              <>
                {day.doses.length === 0 ? (
                  <p className="text-text-secondary text-[16px]">
                    {t.family.noMedicinesThatDay}
                  </p>
                ) : (
                  day.doses.map((d) => (
                    <div key={d.slot} className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-col">
                        <p className="text-text-primary text-[16px] leading-[1.3] font-medium">
                          {slotName(d.slot, locale)}
                        </p>
                        <p className="text-text-secondary truncate text-[14px] leading-[1.3]">
                          {d.medicineNames.join(", ")}
                        </p>
                      </div>
                      {/* Words, not colour. A dose is confirmed, skipped, or
                          simply not answered — and the last of those is not a
                          failure, so it is stated as flatly as the others. */}
                      <p
                        className={
                          "shrink-0 text-[15px] leading-[1.3] " +
                          (d.status === "confirmed"
                            ? "text-text-primary font-medium"
                            : "text-text-secondary")
                        }
                      >
                        {d.status === "confirmed"
                          ? t.family.doseConfirmed
                          : d.status === "skipped"
                            ? t.family.doseSkipped
                            : t.family.doseUnconfirmed}
                      </p>
                    </div>
                  ))
                )}

                {/* Anything else that happened, stated plainly. */}
                {day.readings.map((r, i) => (
                  <p key={`r${i}`} className="text-text-secondary text-[15px] leading-[1.4]">
                    {r.type === "blood_pressure"
                      ? t.family.updates.bloodPressure(r.value, r.unit)
                      : r.type === "blood_sugar"
                        ? t.family.updates.bloodSugar(r.value, r.unit)
                        : t.family.updates.weight(r.value, r.unit)}
                  </p>
                ))}
                {day.walk ? (
                  <p className="text-text-secondary text-[15px] leading-[1.4]">
                    {!day.walk.didWalk
                      ? t.family.updates.noWalk
                      : day.walk.minutes
                        ? t.family.updates.walked(day.walk.minutes)
                        : t.family.updates.wentForAWalk}
                  </p>
                ) : null}
                {day.documents.map((title, i) => (
                  <p key={`d${i}`} className="text-text-secondary text-[15px] leading-[1.4]">
                    {t.family.updates.documentAdded(title)}
                  </p>
                ))}
              </>
            )}
          </div>
        </div>
      </Sheet>
    </>
  );
}
