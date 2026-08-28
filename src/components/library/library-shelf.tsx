"use client";

import { useState } from "react";
import { Apple, BookOpen, Footprints, Play, Sunrise, Wind } from "lucide-react";
import { Chip, EmptyState, SectionHeading } from "@/components/ui";
import type { LibraryCategory, LibraryGroup } from "@/lib/library-data";
import { useT } from "@/lib/i18n/client";

/**
 * The Library shelf: a language filter, then one section per category.
 *
 * Two levels, no more — she lands here, sees the whole shelf, and taps a card
 * to watch it. There is no category page, no detail page and nothing to search;
 * the shelf is short by design because every item on it was chosen by hand.
 *
 * Filtering happens here rather than on the server. The whole shelf is a few
 * dozen curated rows, so it is already loaded — switching language is instant
 * and costs no round trip.
 *
 * Cards are sized for her: a large picture, an 18px title, and one line of
 * plain facts. Metadata sits on text/secondary rather than the lighter grey
 * used elsewhere in the app, because on this screen it is content she is meant
 * to read rather than a timestamp she can ignore.
 */
const CATEGORY_ICON: Record<LibraryCategory, typeof Sunrise> = {
  morning_routine: Sunrise,
  movement: Footprints,
  mind: Wind,
  health_education: BookOpen,
  food: Apple,
};

/**
 * A language filters the SHELF, and is unrelated to the app's own language —
 * she may well read the app in Hindi and still want an English video. So these
 * names are always shown in the language they name, never translated.
 */
const LANGUAGE_NAME: Record<string, string> = { en: "English", hi: "हिन्दी" };

export function LibraryShelf({ groups }: { groups: LibraryGroup[] }) {
  const t = useT();
  const [language, setLanguage] = useState("all");
  const FILTERS = [
    { value: "all", label: t.library.all },
    { value: "hi", label: LANGUAGE_NAME.hi },
    { value: "en", label: LANGUAGE_NAME.en },
  ];

  const visible = groups
    .map((group) => ({
      ...group,
      items:
        language === "all"
          ? group.items
          : group.items.filter((i) => i.language === language),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* One row of taps. Deliberately not a filter panel. */}
      <div
        role="group"
        aria-label={t.library.filterByLanguage}
        className="flex shrink-0 flex-wrap gap-2"
      >
        {FILTERS.map((f) => (
          <Chip
            key={f.value}
            selected={language === f.value}
            onClick={() => setLanguage(f.value)}
            className={f.value === "hi" ? "text-[18px]" : undefined}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          className="shrink-0"
          message={t.library.nothingInLanguage(
            LANGUAGE_NAME[language] ?? language,
          )}
        />
      ) : (
        visible.map((group) => {
          const Icon = CATEGORY_ICON[group.category];
          return (
            <section key={group.category} className="flex shrink-0 flex-col gap-2.5">
              <SectionHeading>{t.library.categories[group.category]}</SectionHeading>

              {group.items.map((item) => (
                <a
                  key={item.id}
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-default border-border-soft active:bg-surface-tinted flex w-full items-center gap-3 rounded-xl border-[0.5px] p-3 transition-colors"
                >
                  <span className="bg-surface-tinted relative flex h-[90px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-md">
                    {item.thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.thumbnailUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Icon size={32} className="text-action-primary" aria-hidden />
                    )}
                    {/* Says "this plays" without a word of explanation. */}
                    {item.contentType === "video" ? (
                      <span className="bg-action-primary text-text-on-brand absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full">
                        <Play size={14} fill="currentColor" aria-hidden />
                      </span>
                    ) : null}
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
                    <span className="text-text-secondary text-[14px] leading-[1.2]">
                      {[
                        item.durationMinutes
                          ? t.units.minutesShort(item.durationMinutes)
                          : null,
                        LANGUAGE_NAME[item.language] ?? item.language,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </a>
              ))}
            </section>
          );
        })
      )}
    </>
  );
}
