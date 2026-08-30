"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Apple,
  BookOpen,
  Flower2,
  Footprints,
  HeartPulse,
  Moon,
  Play,
  Sunrise,
  Wind,
} from "lucide-react";
import { Chip, EmptyState, SectionHeading } from "@/components/ui";
import type { LibraryItem } from "@/lib/library-data";
import { CATEGORY_ORDER, type ShelfCategory } from "@/lib/library-categories";
import { useT } from "@/lib/i18n/client";

/**
 * The Library shelf: pick a subject, then pick a thing to watch.
 *
 * Subject is the navigation now. It used to be language — All, हिन्दी, English
 * — which asked her the one question she has no reason to care about: nobody
 * comes to this screen wanting "something in Hindi", they come wanting help
 * sleeping or a way to loosen a stiff morning. Language is still on every item
 * and can still be narrowed, but it sits underneath the subject rather than in
 * front of it, and only appears when the shelf she is looking at actually
 * holds both.
 *
 * The cards stand up rather than lie down. A picture across the full width of
 * the card, the title under it, and one short line of facts — which is the
 * shape a thing-you-might-watch already has everywhere else she looks. The old
 * horizontal row gave the thumbnail a third of the width and spent the rest on
 * a description she was scanning past; the picture is what she actually
 * chooses by, so it gets the room.
 */
const CATEGORY_ICON: Record<ShelfCategory, typeof Sunrise> = {
  yoga_movement: Flower2,
  pranayama_breathing: Wind,
  meditation_relaxation: Moon,
  walking_mobility: Footprints,
  morning_daily_routine: Sunrise,
  healthy_ageing: HeartPulse,
  food_wellness: Apple,
  health_basics: BookOpen,
};

/**
 * A language names itself. She may well read the app in Hindi and still want
 * an English video, so these are never translated.
 */
const LANGUAGE_NAME: Record<string, string> = { en: "English", hi: "हिन्दी" };

export function LibraryShelf({ items }: { items: LibraryItem[] }) {
  const t = useT();

  // Only subjects that actually have something on them. An empty chip is a
  // promise the shelf cannot keep.
  const categories = CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c));

  const [category, setCategory] = useState<ShelfCategory | null>(categories[0] ?? null);
  const [language, setLanguage] = useState("all");

  const inCategory = items.filter((i) => i.category === category);
  const languages = [...new Set(inCategory.map((i) => i.language))];
  const visible =
    language === "all" ? inCategory : inCategory.filter((i) => i.language === language);

  if (!category) {
    return <EmptyState className="shrink-0" message={t.library.comingSoon} />;
  }

  return (
    <>
      {/* One row of taps, scrolled sideways rather than wrapped into a block
          of chips. The negative margin lets it run to the screen edge so it
          reads as "there is more this way" — the page itself never scrolls
          sideways. */}
      <div
        role="group"
        aria-label={t.library.chooseSubject}
        className="-mx-4 flex shrink-0 gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((c) => (
          <Chip
            key={c}
            selected={category === c}
            onClick={() => {
              setCategory(c);
              // A language chosen on one shelf should not silently empty the
              // next one.
              setLanguage("all");
            }}
          >
            {t.library.categories[c]}
          </Chip>
        ))}
      </div>

      <section className="flex shrink-0 flex-col gap-2.5">
        <SectionHeading>{t.library.categories[category]}</SectionHeading>

        {/* Secondary, and absent entirely unless this shelf holds both. */}
        {languages.length > 1 ? (
          <div
            role="group"
            aria-label={t.library.filterByLanguage}
            className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1"
          >
            {[{ value: "all", label: t.library.all }, ...languages.map((l) => ({
              value: l,
              label: LANGUAGE_NAME[l] ?? l,
            }))].map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={language === f.value}
                onClick={() => setLanguage(f.value)}
                className={
                  language === f.value
                    ? "text-action-primary text-[16px] leading-[1.4] font-medium underline underline-offset-4"
                    : "text-text-secondary text-[16px] leading-[1.4]"
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}

        {visible.length === 0 ? (
          <EmptyState
            className="shrink-0"
            message={t.library.nothingInLanguage(LANGUAGE_NAME[language] ?? language)}
          />
        ) : (
          visible.map((item) => <LibraryCard key={item.id} item={item} />)
        )}
      </section>
    </>
  );
}

function LibraryCard({ item }: { item: LibraryItem }) {
  const t = useT();
  // Legacy rows fall back rather than crashing on a missing icon.
  const Icon = CATEGORY_ICON[item.category as ShelfCategory] ?? BookOpen;
  const minutes = item.durationSeconds ? Math.round(item.durationSeconds / 60) : null;

  /**
   * Two facts, and only where they earn their place.
   *
   * Language, because she may want one and not the other. Then the length, or
   * "Short" when there is no useful length to give — a forty-second clip is
   * better described than measured. Nothing says "Video": that is what the
   * whole card already looks like.
   *
   * The creator is deliberately not here. It matters, and it is on the screen
   * where she is deciding whether to trust what she is about to watch, rather
   * than on a browsing card where it is one more thing to read past.
   */
  const facts = [
    LANGUAGE_NAME[item.language] ?? item.language,
    item.contentType === "short"
      ? t.library.shortLabel
      : minutes && minutes > 0
        ? t.units.minutesShort(minutes)
        : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/library/${item.id}`}
      /* The whole card is the target — nothing here is a small tap. Flat, as
         everything in this system is: a hairline border and a fill, no shadow.
         overflow-hidden lets the picture run to the card's own edges and take
         its rounded corners, which is what gives it the weight. */
      className="bg-surface-default border-border-soft active:bg-surface-tinted block w-full overflow-hidden rounded-xl border-[0.5px] transition-colors"
    >
      <span className="bg-surface-tinted relative flex aspect-video w-full items-center justify-center">
        {item.thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.thumbnailUrl} alt="" className="size-full object-cover" />
        ) : (
          <Icon size={40} className="text-action-primary" aria-hidden />
        )}
        {/* Says "this plays" without a word of explanation. */}
        <span className="bg-action-primary text-text-on-brand absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full">
          <Play size={20} fill="currentColor" aria-hidden />
        </span>
      </span>

      <span className="flex flex-col gap-1 p-4">
        <span className="text-text-primary text-[18px] leading-[1.3] font-medium">
          {item.title}
        </span>
        <span className="text-text-secondary text-[16px] leading-[1.2]">
          {facts.join(" · ")}
        </span>
      </span>
    </Link>
  );
}
