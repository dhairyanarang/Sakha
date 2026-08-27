"use client";

import { usePathname } from "next/navigation";

/**
 * Paints behind the iOS status bar.
 *
 * With black-translucent the page draws under the status bar — the only way
 * Home's gradient can reach it, since iOS fills that strip with a flat colour
 * otherwise and never a gradient. The catch is that the status bar text goes
 * white on every screen, so the light screens need something behind it too or
 * the clock disappears.
 *
 * Home continues its gradient; everywhere else gets a solid brand strip, which
 * reads as a tinted status bar rather than a stray band of gradient.
 *
 * Height is the top inset, so this is nothing on Android and desktop.
 */
export function StatusBarBackdrop() {
  const isHome = usePathname() === "/";
  return (
    <div
      aria-hidden
      className={
        isHome
          ? "pointer-events-none fixed inset-x-0 top-0 z-40 bg-[linear-gradient(to_right,var(--brand-500),var(--brand-700))]"
          : "bg-action-primary pointer-events-none fixed inset-x-0 top-0 z-40"
      }
      style={{ height: "env(safe-area-inset-top)" }}
    />
  );
}
