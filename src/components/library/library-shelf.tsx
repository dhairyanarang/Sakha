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
 * Cards are sized for her: a large picture, an 18px title, and one line of
 * plain facts. Metadata sits on text/secondary rather than the lighter grey
 * used elsewhere, because here it is content she is meant to read.
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

  const facts = [
    minutes && minutes > 0 ? t.units.minutesShort(minutes) : null,
    LANGUAGE_NAME[item.language] ?? item.language,
    item.source,
  ].filter(Boolean);

  return (
    <Link
      href={`/library/${item.id}`}
      className="bg-surface-default border-border-soft active:bg-surface-tinted flex w-full items-center gap-3 rounded-xl border-[0.5px] p-3 transition-colors"
    >
      <span className="bg-surface-tinted relative flex h-[90px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-md">
        {item.thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.thumbnailUrl} alt="" className="size-full object-cover" />
        ) : (
          <Icon size={32} className="text-action-primary" aria-hidden />
        )}
        {/* Says "this plays" without a word of explanation. */}
        <span className="bg-action-primary text-text-on-brand absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full">
          <Play size={14} fill="currentColor" aria-hidden />
        </span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-text-primary text-[18px] leading-[1.3] font-medium">
          {item.title}
        </span>
        {item.description ? (
          <span className="text-text-secondary line-clamp-2 text-[16px] leading-[1.4]">
            {item.description}
          </span>
        ) : null}
        <span className="text-text-secondary line-clamp-1 text-[14px] leading-[1.2]">
          {facts.join(" · ")}
        </span>
      </span>
    </Link>
  );
}
