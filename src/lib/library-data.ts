import { createClient } from "@/lib/supabase/server";
import type { LibraryCategory } from "@/lib/library-categories";

export type { LibraryCategory, ShelfCategory } from "@/lib/library-categories";
export { CATEGORY_ORDER } from "@/lib/library-categories";

export type LibraryItem = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  externalUrl: string;
  youtubeId: string | null;
  category: LibraryCategory;
  language: string;
  durationSeconds: number | null;
  contentType: string;
  source: string | null;
  contentNote: string | null;
};

const COLUMNS =
  "id, title, description, thumbnail_url, external_url, youtube_id, category, language, duration_seconds, duration_minutes, content_type, source, content_note";

type Row = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  external_url: string;
  youtube_id: string | null;
  category: LibraryCategory;
  language: string;
  duration_seconds: number | null;
  duration_minutes: number | null;
  content_type: string;
  source: string | null;
  content_note: string | null;
};

/**
 * duration_seconds is the column this catalogue writes; duration_minutes is
 * what the first placeholder rows used. Reading both means neither has to be
 * migrated to keep the card honest about how long something takes.
 */
function toItem(row: Row): LibraryItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    externalUrl: row.external_url,
    youtubeId: row.youtube_id,
    category: row.category,
    language: row.language,
    durationSeconds: row.duration_seconds ?? (row.duration_minutes ? row.duration_minutes * 60 : null),
    contentType: row.content_type,
    source: row.source,
    contentNote: row.content_note,
  };
}

/**
 * Everything published, in shelf order.
 *
 * One query for the whole shelf. This is a curated list of tens of items, not
 * a feed — fetching it whole means switching category is instant and needs no
 * round trip, and there is nothing to paginate.
 *
 * Drafts never arrive here, and not because of this filter: the RLS policy on
 * library_items only permits published rows, so an unapproved item is
 * unreachable even by typing its URL.
 */
export async function getLibrary(): Promise<LibraryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("library_items")
    .select(COLUMNS)
    .eq("published", true)
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => toItem(row as Row));
}

/** One item, for its own screen. Null when it does not exist or is a draft. */
export async function getLibraryItem(id: string): Promise<LibraryItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("library_items")
    .select(COLUMNS)
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  return data ? toItem(data as Row) : null;
}

/**
 * A few more from the same shelf.
 *
 * Same category, never the item being watched, and capped at three. This is
 * deliberately not a recommendation: it is the rest of that section, in the
 * order a person put them in, so the screen ends somewhere rather than
 * continuing forever.
 */
export async function getRelated(item: LibraryItem): Promise<LibraryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("library_items")
    .select(COLUMNS)
    .eq("published", true)
    .eq("category", item.category)
    .neq("id", item.id)
    .order("sort_order", { ascending: true })
    .limit(3);

  return (data ?? []).map((row) => toItem(row as Row));
}
