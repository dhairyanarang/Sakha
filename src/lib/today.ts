import type { Enums } from "@/lib/supabase/types";
import { messagesFor, type Locale } from "@/lib/i18n";

/**
 * Everything "today" is computed in her timezone, never UTC. At 1am in Delhi
 * a UTC date is still yesterday, which would show her the wrong day's medicines.
 */
export const TZ = "Asia/Kolkata";

/**
 * Dates and times are localised; NUMBERS ARE NOT.
 *
 * Hindi renders month and weekday names properly through Intl (अगस्त,
 * शुक्रवार) but the digits stay Western, because `hi-IN` uses 0-9 by default
 * and that is the right answer here: her glucometer, her BP machine and every
 * lab report she owns print 0-9. A sugar reading of १२४ would be the one
 * number on the screen she could not read at a glance.
 */
const INTL_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  hi: "hi-IN",
};

/** YYYY-MM-DD in her timezone — the shape `local_date` columns store. */
export function localDate(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}


function hourIST(at: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(at),
  );
}

export function greeting(locale: Locale = "en", at: Date = new Date()): string {
  const t = messagesFor(locale);
  const h = hourIST(at);
  if (h < 12) return t.time.goodMorning;
  if (h < 17) return t.time.goodAfternoon;
  return t.time.goodEvening;
}

/**
 * Display times for each slot.
 *
 * The Add Medicine screen collects a slot, not a clock time, so these are a
 * product decision rather than something she entered — they exist so the card
 * can say "9:00 AM" instead of "Morning". If per-medicine times are ever
 * collected, this table goes away.
 */
const SLOT_HOUR: Record<Enums<"time_of_day">, number> = {
  morning: 9,
  afternoon: 14,
  evening: 20,
};

/** "9:00 AM" / "सुबह 9:00" */
export function slotTime(slot: Enums<"time_of_day">, locale: Locale = "en"): string {
  return formatHourMinute(SLOT_HOUR[slot], 0, locale);
}

/** "Morning Medicine" / "सुबह की दवा" */
export function slotLabel(slot: Enums<"time_of_day">, locale: Locale = "en"): string {
  return messagesFor(locale).time.slotMedicine[slot];
}

/** Just the part of the day: "Morning" / "सुबह" */
export function slotName(slot: Enums<"time_of_day">, locale: Locale = "en"): string {
  return messagesFor(locale).time.slot[slot];
}

export const SLOT_ORDER: Enums<"time_of_day">[] = ["morning", "afternoon", "evening"];

/**
 * Has this time of day arrived yet?
 *
 * Confirming a dose she has not taken is the one mistake worth designing
 * against: a mis-tap on the evening row in the morning marks it Done, and she
 * may then skip the real dose because the app says she took it.
 *
 * The window opens at the START of the period rather than at the displayed
 * time, so taking an evening tablet at six is still recordable. Earlier slots
 * never close — confirmation stays possible at any time afterwards, which is a
 * hard rule and the whole point of it.
 */
export function slotHasStarted(slot: Enums<"time_of_day">, at: Date = new Date()): boolean {
  const h = hourIST(at);
  if (slot === "morning") return true;
  if (slot === "afternoon") return h >= 12;
  return h >= 17;
}

/** Which slot we're currently in, so the soonest unconfirmed dose leads. */
export function currentSlot(at: Date = new Date()): Enums<"time_of_day"> {
  const h = hourIST(at);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

/**
 * A clock time, the way each language actually says one.
 *
 * English gets "9:12 AM". Hindi does not use AM/PM in speech — she would say
 * "सुबह नौ बजे", never "नौ बजे ए एम" — so Hindi names the part of the day
 * instead and keeps the digits: "सुबह 9:12". That is both more natural AND
 * less ambiguous than am/pm for someone reading quickly.
 */
const HINDI_PART_OF_DAY = (hour: number): string => {
  if (hour < 4) return "रात";
  if (hour < 12) return "सुबह";
  if (hour < 16) return "दोपहर";
  if (hour < 19) return "शाम";
  return "रात";
};

function formatHourMinute(hour: number, minute: number, locale: Locale): string {
  const mm = String(minute).padStart(2, "0");
  if (locale === "hi") {
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${HINDI_PART_OF_DAY(hour)} ${h12}:${mm}`;
  }
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return `${h12}:${mm} ${suffix}`;
}

/** "9:12 AM" / "सुबह 9:12" in her timezone. */
export function clockLabel(at: Date, locale: Locale = "en"): string {
  return clockTime(at, locale);
}

function clockTime(at: Date, locale: Locale): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(at);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return formatHourMinute(hour === 24 ? 0 : hour, minute, locale);
}

/**
 * How long ago something was, in words.
 *
 * Plain and unhurried: "Today, 9:12 AM", "3 days ago". No seconds, no "just
 * now" ticking over while she reads it, and nothing that implies she is late
 * for anything. Anything older than about a month gets a real date instead,
 * because "7 weeks ago" stops meaning much.
 *
 * A bare YYYY-MM-DD (a document's own date) has no time to show, so it never
 * gets one — it is parsed as local noon so that a timezone shift cannot roll
 * it onto the wrong day.
 */
export function relativeWhen(
  value: string,
  locale: Locale = "en",
  now: Date = new Date(),
): string {
  const t = messagesFor(locale);
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const at = dateOnly ? new Date(`${value}T12:00:00`) : new Date(value);
  if (Number.isNaN(at.getTime())) return "";

  const today = localDate(now);
  const then = localDate(at);
  if (then === today) {
    return dateOnly ? t.time.today : t.time.todayAt(clockTime(at, locale));
  }

  // Difference in calendar days in her timezone, not elapsed hours — 11pm to
  // 1am is "yesterday", not "2 hours ago".
  const days = Math.round(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${then}T00:00:00Z`)) / 86_400_000,
  );
  if (days === 1) return t.time.yesterday;
  if (days < 7) return t.time.daysAgo(days);
  if (days < 14) return t.time.oneWeekAgo;
  if (days < 35) return t.time.weeksAgo(Math.floor(days / 7));

  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    timeZone: TZ,
    day: "numeric",
    month: "long",
  }).format(at);
}

/**
 * How a single reading is stamped in the history list: "Today, 10:20 AM",
 * otherwise "Aug 22, 10:20 AM" — and in Hindi "आज, सुबह 10:20" / "22 अगस्त,
 * सुबह 10:20".
 *
 * Deliberately not relativeWhen — a list of readings is being compared
 * against itself, and "3 days ago" beside "5 days ago" is harder to place
 * than two real dates.
 *
 * Hindi uses the full month name rather than Intl's abbreviation, which
 * renders as "अग॰" — a truncation mark she has no reason to recognise.
 */
export function readingStamp(iso: string, locale: Locale = "en", now: Date = new Date()): string {
  const t = messagesFor(locale);
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const time = clockTime(at, locale);
  if (localDate(at) === localDate(now)) return t.time.todayAt(time);
  const day = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-US", {
    timeZone: TZ,
    month: locale === "hi" ? "long" : "short",
    day: "2-digit",
  }).format(at);
  return t.time.dateAt(day, time);
}
