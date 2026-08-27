import type { Enums } from "@/lib/supabase/types";

/**
 * Everything "today" is computed in her timezone, never UTC. At 1am in Delhi
 * a UTC date is still yesterday, which would show her the wrong day's medicines.
 */
export const TZ = "Asia/Kolkata";

/** YYYY-MM-DD in her timezone — the shape `local_date` columns store. */
export function localDate(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

/** "Friday, 28 August" */
export function longDate(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(at);
}

function hourIST(at: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(at),
  );
}

export function greeting(at: Date = new Date()): string {
  const h = hourIST(at);
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Display times for each slot.
 *
 * The Add Medicine screen collects a slot, not a clock time, so these are a
 * product decision rather than something she entered — they exist so the card
 * can say "9:00 AM" instead of "Morning". If per-medicine times are ever
 * collected, this table goes away.
 */
export const SLOT_TIME: Record<Enums<"time_of_day">, string> = {
  morning: "9:00 AM",
  afternoon: "2:00 PM",
  evening: "8:00 PM",
};

export const SLOT_LABEL: Record<Enums<"time_of_day">, string> = {
  morning: "Morning Medicine",
  afternoon: "Afternoon Medicine",
  evening: "Evening Medicine",
};

export const SLOT_ORDER: Enums<"time_of_day">[] = ["morning", "afternoon", "evening"];

/** Which slot we're currently in, so the soonest unconfirmed dose leads. */
export function currentSlot(at: Date = new Date()): Enums<"time_of_day"> {
  const h = hourIST(at);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

/** "9:12 AM" in her timezone. */
function clockTime(at: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(at);
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
export function relativeWhen(value: string, now: Date = new Date()): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const at = dateOnly ? new Date(`${value}T12:00:00`) : new Date(value);
  if (Number.isNaN(at.getTime())) return "";

  const today = localDate(now);
  const then = localDate(at);
  if (then === today) return dateOnly ? "Today" : `Today, ${clockTime(at)}`;

  // Difference in calendar days in her timezone, not elapsed hours — 11pm to
  // 1am is "yesterday", not "2 hours ago".
  const days = Math.round(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${then}T00:00:00Z`)) / 86_400_000,
  );
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 35) return `${Math.floor(days / 7)} weeks ago`;

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
  }).format(at);
}

/**
 * How a single reading is stamped in the history list: "Today, 10:20 AM",
 * otherwise "Aug 22, 10:20 AM".
 *
 * Deliberately not relativeWhen — a list of readings is being compared
 * against itself, and "3 days ago" beside "5 days ago" is harder to place
 * than two real dates.
 */
export function readingStamp(iso: string, now: Date = new Date()): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const time = clockTime(at);
  if (localDate(at) === localDate(now)) return `Today, ${time}`;
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "short",
    day: "2-digit",
  }).format(at);
  return `${day}, ${time}`;
}
