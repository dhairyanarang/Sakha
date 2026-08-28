"use client";

import Link from "next/link";
import { HeartPulse, House, LibraryBig, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/client";
import { FixedBar } from "./fixed-bar";

/**
 * Bottom Nav — 88px tall, white, border/faint hairline on top. Three tabs.
 *
 * The active tab shifts to section-label (Semi Bold) and action/primary for
 * both icon and text; inactive icons use the icon/stroke token at 60% rather
 * than a flat solid. Icon stroke weights are taken from the Figma vectors.
 *
 * The bar's white fill runs to the physical bottom edge; the safe-area inset
 * is applied as padding INSIDE it, so the labels clear the iPhone home
 * indicator without leaving a strip of page colour beneath the bar.
 *
 * That inset, and the 8px above the icons, live on each TAB rather than on the
 * bar. The spacing is identical either way, but it makes the whole third of the
 * bar tappable — 74px tall instead of the 42px the icon and label occupy — so
 * a tap near the bottom edge or beside the label still lands. Nothing grew
 * visually; the target simply now covers the padding it always sat in.
 *
 * Every tab prefetches in full. These routes are dynamic, and for a dynamic
 * route the default prefetch only reaches the nearest loading boundary — of
 * which there are none here, so the default fetched nothing at all and each
 * tab switch waited on a cold server render. prefetch forces the whole route,
 * data included, and the bar is always on screen so all three warm up as soon
 * as a tab renders. (Prefetching only runs in production builds.)
 */
export type NavTab = "home" | "health" | "library" | "profile";

/**
 * Three tabs either way, and never a fourth.
 *
 * A family member gets Profile where she gets Library. The Library is a shelf
 * curated for HER — gentle exercises, things to try in her own day — and it
 * belongs to the person living that day, not to someone checking in on her. In
 * its place they get the one screen she reaches through the header avatar
 * instead, because their Home has no avatar of hers to tap.
 */
const TABS: Record<"owner" | "family", { id: NavTab; href: string; Icon: typeof House }[]> = {
  owner: [
    { id: "home", href: "/", Icon: House },
    { id: "health", href: "/health", Icon: HeartPulse },
    { id: "library", href: "/library", Icon: LibraryBig },
  ],
  family: [
    { id: "home", href: "/", Icon: House },
    { id: "health", href: "/health", Icon: HeartPulse },
    { id: "profile", href: "/profile", Icon: User },
  ],
};

export interface BottomNavProps extends React.ComponentPropsWithoutRef<"nav"> {
  active: NavTab;
  variant?: "owner" | "family";
}

export function BottomNav({
  active,
  variant = "owner",
  className,
  ...props
}: BottomNavProps) {
  const t = useT();
  return (
    <FixedBar reserve={75}>
    <nav
      aria-label={t.nav.mainLabel}
      className={cn(
        "bg-surface-default border-border-faint flex w-full border-t px-3",
        className,
      )}
      {...props}
    >
      {TABS[variant].map(({ id, href, Icon }) => {
        const isActive = id === active;
        return (
          <Link
            key={id}
            href={href}
            prefetch
            aria-current={isActive ? "page" : undefined}
            style={{ paddingBottom: "var(--spacing-6)" }}
            className="flex flex-1 flex-col items-center justify-center gap-1 pt-2"
          >
            <Icon
              size={24}
              strokeWidth={isActive ? 1.75 : 1.36}
              className={isActive ? "text-action-primary" : "text-icon-stroke"}
              aria-hidden
            />
            <span
              className={
                isActive
                  ? "text-section-label text-action-primary"
                  : "text-nav-label text-text-secondary"
              }
            >
              {t.nav[id]}
            </span>
          </Link>
        );
      })}
    </nav>
    </FixedBar>
  );
}
