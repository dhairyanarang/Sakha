import type { Enums } from "@/lib/supabase/types";

export type LibraryCategory = Enums<"library_category">;

/**
 * The order the shelf reads in.
 *
 * Its own module, with no server imports, because the shelf is a Client
 * Component and needs this list. Left in library-data.ts it dragged
 * next/headers into the browser bundle through the Supabase server client.
 *
 * Fixed in code rather than in a table: it is editorial, and a table would
 * only mean another thing to keep in step. What each category is CALLED lives
 * in the dictionary, because it is copy and has to exist in both languages.
 *
 * Movement first, because it is the thing most likely to be acted on; the
 * reading-and-understanding categories sit at the end.
 */
export const CATEGORY_ORDER = [
  "yoga_movement",
  "pranayama_breathing",
  "meditation_relaxation",
  "walking_mobility",
  "morning_daily_routine",
  "healthy_ageing",
  "food_wellness",
  "health_basics",
] as const satisfies readonly LibraryCategory[];

/**
 * The categories the shelf actually shows.
 *
 * Narrower than LibraryCategory on purpose: the enum still carries the five
 * original values while the placeholder rows that use them are published, and
 * those are deliberately not on the new shelf. Deriving this from the ordered
 * list means adding a category is one edit, not three.
 */
export type ShelfCategory = (typeof CATEGORY_ORDER)[number];
