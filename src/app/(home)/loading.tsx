/**
 * What the browser is allowed to paint before Home has its data.
 *
 * Not a loading state — she never sees this. It exists so that Next has a
 * streaming boundary here at all.
 *
 * Without one, nothing in the document could be flushed until the whole of
 * Home had finished: the session check in proxy, the membership lookup, and
 * six queries to Mumbai. The splash lives in the root layout and was sitting
 * behind all of it, so launching the installed app meant staring at the flat
 * startup image while the server did database work. With this boundary the
 * shell — and the splash inside it — goes out immediately and Home streams in
 * behind the animation, which then covers the whole of the wait.
 *
 * It is a plain block of the page colour on purpose. There is no spinner and
 * no skeleton: the bottom nav prefetches every tab in full, so a navigation
 * to Home arrives from the client cache and never suspends here. On the one
 * path that does reach it — a cold launch — the splash is on top of it.
 */
export default function Loading() {
  return <div className="bg-surface-page flex flex-1 flex-col" />;
}
