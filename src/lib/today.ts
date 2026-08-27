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
