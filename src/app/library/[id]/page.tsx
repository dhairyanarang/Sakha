import { notFound } from "next/navigation";
import Link from "next/link";
import { Info, Play } from "lucide-react";
import { requireOwner } from "@/lib/account";
import { getLibraryItem, getRelated } from "@/lib/library-data";
import { ScreenHeader } from "@/components/screen-header";
import { VideoPlayer } from "@/components/library/video-player";
import { getMessages } from "@/lib/i18n/server";

/**
 * One thing from the shelf, playing inside Sakha.
 *
 * She watches here and stays here. The alternative — a link that throws her
 * into the YouTube app — loses her to a feed built to keep her, and getting
 * back to Sakha then means knowing to press a system back gesture twice.
 *
 * The screen ends deliberately. Player, what it is, who made it, and at most
 * three more from the same shelf. No autoplay, no queue, nothing that
 * continues once the video stops.
 */
const LANGUAGE_NAME: Record<string, string> = { en: "English", hi: "हिन्दी" };

export default async function LibraryItemPage({ params }: PageProps<"/library/[id]">) {
  // Owner only, exactly as the shelf is: this is curated for the person living
  // the day it is meant to improve.
  await requireOwner();

  const { id } = await params;
  const item = await getLibraryItem(id);
  // A draft is unreachable here even by typing the URL — the RLS policy only
  // returns published rows, so an unapproved item is simply not found.
  if (!item) notFound();

  const [related, t] = await Promise.all([getRelated(item), getMessages()]);
  const minutes = item.durationSeconds ? Math.round(item.durationSeconds / 60) : null;
  const isShort = item.contentType === "short";

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <ScreenHeader backHref="/library" title={t.library.title} />

      <main className="flex flex-1 flex-col gap-6 p-4">
        <section className="flex shrink-0 flex-col gap-3">
          {item.youtubeId ? (
            <VideoPlayer youtubeId={item.youtubeId} title={item.title} isShort={isShort} />
          ) : (
            /* No id means nothing to embed. Rather than an empty black box,
               the original link — the only honest thing left to offer. */
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-tinted text-action-primary flex aspect-video w-full items-center justify-center gap-2 rounded-xl text-[16px] font-medium"
            >
              <Play size={20} aria-hidden />
              {t.library.watchOnYoutube}
            </a>
          )}

          <div className="flex flex-col gap-1.5">
            <h2 className="text-text-primary text-[22px] leading-[1.3] font-medium">
              {item.title}
            </h2>
            <p className="text-text-secondary text-[14px] leading-[1.3]">
              {[
                minutes && minutes > 0 ? t.units.minutesShort(minutes) : null,
                LANGUAGE_NAME[item.language] ?? item.language,
                item.source,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          {/* One line, and only when it says something the title does not. */}
          {item.description ? (
            <p className="text-text-primary text-[18px] leading-[1.5]">{item.description}</p>
          ) : null}

          {/* Rare and only where the video alone could be misread. Deliberately
              not styled as an alarm — it is a note, not a warning. */}
          {item.contentNote ? (
            <div className="bg-surface-tinted flex items-start gap-3 rounded-md p-3">
              <Info size={20} className="text-action-primary mt-0.5 shrink-0" aria-hidden />
              <p className="text-text-primary text-[16px] leading-[1.4]">{item.contentNote}</p>
            </div>
          ) : null}

          <p className="text-text-secondary text-[14px] leading-[1.4]">
            {t.library.notMedicalAdvice}
          </p>
        </section>

        {related.length > 0 ? (
          <section className="flex shrink-0 flex-col gap-2.5">
            <h3 className="text-text-primary text-[18px] leading-[1.2] font-medium">
              {t.library.moreLikeThis}
            </h3>
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/library/${r.id}`}
                className="bg-surface-default border-border-soft active:bg-surface-tinted flex items-center gap-3 rounded-xl border-[0.5px] p-3 transition-colors"
              >
                <span className="bg-surface-tinted relative h-[68px] w-[92px] shrink-0 overflow-hidden rounded-md">
                  {r.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={r.thumbnailUrl} alt="" className="size-full object-cover" />
                  ) : null}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-text-primary line-clamp-2 text-[16px] leading-[1.3] font-medium">
                    {r.title}
                  </span>
                  <span className="text-text-secondary line-clamp-1 text-[14px] leading-[1.2]">
                    {r.source}
                  </span>
                </span>
              </Link>
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}
