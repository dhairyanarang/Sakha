"use client";

import { usePathname } from "next/navigation";

/**
 * Paints the area behind the iOS status bar.
 *
 * `black-translucent` lets the page draw under the status bar — the only way
 * Home's gradient can reach the top — but it also forces the status bar text
 * white on every screen. So Home continues its gradient up there, and every
 * other screen gets the plain page colour rather than a blue band floating
 * above a light screen.
 *
 * Height is the safe-area inset, so this collapses to nothing on Android and
 * desktop where no such inset exists.
 */
export function StatusBarBackdrop() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      aria-hidden
      className={
        isHome
          ? "pointer-events-none fixed inset-x-0 top-0 z-40 bg-[linear-gradient(to_right,var(--brand-500),var(--brand-700))]"
          : "bg-surface-tinted pointer-events-none fixed inset-x-0 top-0 z-40"
      }
      style={{ height: "env(safe-area-inset-top)" }}
    />
  );
}
