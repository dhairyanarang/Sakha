/**
 * Paints the area behind the iOS status bar.
 *
 * With `black-translucent` the page draws under the status bar and its text is
 * always white — which is what lets Home's gradient reach the top, but would
 * leave white-on-near-white text unreadable on the light screens. A single
 * strip in the same gradient keeps it legible everywhere, and on Home it sits
 * invisibly over the identical gradient already there.
 *
 * Height is zero on any device without an inset, so nothing changes on
 * Android or desktop.
 */
export function StatusBarBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-40 bg-[linear-gradient(to_right,var(--brand-500),var(--brand-700))]"
      style={{ height: "env(safe-area-inset-top)" }}
    />
  );
}
