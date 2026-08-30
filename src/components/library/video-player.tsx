/**
 * The player, inside Sakha.
 *
 * youtube-nocookie.com is YouTube's own privacy-enhanced host: it does not set
 * its tracking cookies until she actually presses play. Same official player,
 * same embed terms — just the version that does not follow her around.
 *
 * The parameters are all subtractive, and every one of them is there to keep
 * this from becoming a feed:
 *
 *   rel=0            — the grid at the end stays within the same channel
 *                      rather than opening the whole of YouTube. YouTube no
 *                      longer allows removing it entirely; this is as far as
 *                      the platform permits.
 *   modestbranding=1 — no YouTube wordmark sitting over the video.
 *   playsinline=1    — plays in place on iOS instead of taking over the screen
 *                      and dropping her back into Safari when it finishes.
 *
 * There is deliberately no autoplay: nothing starts talking at her because she
 * opened a page. She presses play.
 *
 * A Short is the same player in a tall frame — capped by height rather than
 * width, or a 9:16 box would run off the bottom of a phone.
 */
export function VideoPlayer({
  youtubeId,
  title,
  isShort,
}: {
  youtubeId: string;
  title: string;
  isShort: boolean;
}) {
  const src =
    `https://www.youtube-nocookie.com/embed/${youtubeId}` +
    `?rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className={isShort ? "flex justify-center" : undefined}>
      <div
        className={
          isShort
            ? "aspect-[9/16] max-h-[60dvh] w-auto overflow-hidden rounded-xl bg-black"
            : "aspect-video w-full overflow-hidden rounded-xl bg-black"
        }
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="size-full border-0"
        />
      </div>
    </div>
  );
}
