import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { getT } from "@/lib/i18n/server";

/**
 * "You are looking at a Saturday in August, not at today."
 *
 * Sits directly under the viewing banner, because that banner already answers
 * WHOSE information this is and the date is the other half of the same
 * sentence — whose, and when. Two separate pieces of context scattered down
 * the screen would be easier to miss than one block that reads as a unit.
 *
 * Only rendered when a date is being viewed. Today has no banner of its own:
 * the absence of this is what "today" looks like, so returning to it removes
 * something rather than adding another state to read.
 *
 * Deliberately not an alarm colour and not a warning. Looking at last Tuesday
 * is a normal thing to do, not a mistake to be corrected — the tint is the
 * same brand wash the viewing banner uses.
 */
export async function DateContext({ date }: { date: string }) {
  const { t, locale } = await getT();

  // Parsed as UTC noon so the label can never slip a day either side of the
  // date string, whatever the reader's own timezone is.
  const shown = new Date(`${date}T12:00:00Z`);
  const long = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(shown);

  return (
    <section className="flex shrink-0 items-center justify-center gap-3 rounded-md bg-[rgb(85_81_255/0.08)] px-3 py-2.5">
      <CalendarDays size={24} className="text-action-primary shrink-0" aria-hidden />
      <p className="text-action-primary min-w-0 flex-1 text-[16px] leading-[1.4]">{long}</p>
      {/* One tap back, and a link rather than a control that needs state — so
          it works before hydration and can be opened in place. */}
      <Link
        href="/"
        prefetch
        className="border-action-primary text-action-primary active:bg-surface-default flex w-[100px] shrink-0 items-center justify-center rounded-sm border px-4 py-2.5 text-center text-[16px] leading-[1.2] transition-colors"
      >
        {t.family.today}
      </Link>
    </section>
  );
}
