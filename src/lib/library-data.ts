import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/types";

export type LibraryCategory = Enums<"library_category">;

export type LibraryItem = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  externalUrl: string;
  category: LibraryCategory;
  language: string;
  durationMinutes: number | null;
  contentType: string;
};

export type LibraryGroup = {
  category: LibraryCategory;
  label: string;
  items: LibraryItem[];
};

/**
 * The order the shelf reads in, and what each section is called.
 *
 * Fixed here rather than in the database: it is editorial, it is two words per
 * line, and a table would only mean another thing to keep in step. Adding a
 * category means adding an enum value and a line here.
 */
export const CATEGORY_LABELS: Record<LibraryCategory, string> = {
  morning_routine: "Morning & Daily Routine",
  movement: "Movement & Exercise",
  mind: "Mind & Relaxation",
  health_education: "Health Education",
  food: "Food & Nutrition",
};

const CATEGORY_ORDER: LibraryCategory[] = [
  "morning_routine",
  "movement",
  "mind",
  "health_education",
  "food",
];

/**
 * Everything published, grouped by category.
 *
 * One query for the whole shelf. This is a curated list of tens of items, not
 * a feed — fetching it whole means the language filter is instant and needs no
 * round trip, and there is nothing to paginate.
 */
export async function getLibrary(): Promise<LibraryGroup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("library_items")
    .select(
      "id, title, description, thumbnail_url, external_url, category, language, duration_minutes, content_type",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true });

  const items: LibraryItem[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    externalUrl: row.external_url,
    category: row.category,
    language: row.language,
    durationMinutes: row.duration_minutes,
    contentType: row.content_type,
  }));

  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: items.filter((i) => i.category === category),
  })).filter((group) => group.items.length > 0);
}
