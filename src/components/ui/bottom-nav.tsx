"use client";

import Link from "next/link";
import { HeartPulse, House, LibraryBig } from "lucide-react";
import { cn } from "@/lib/cn";

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
 */
export type NavTab = "home" | "health" | "library";

const TABS = [
  { id: "home" as const, label: "Home", href: "/", Icon: House },
  { id: "health" as const, label: "Health", href: "/health", Icon: HeartPulse },
  { id: "library" as const, label: "Library", href: "/library", Icon: LibraryBig },
];

export interface BottomNavProps extends React.ComponentPropsWithoutRef<"nav"> {
  active: NavTab;
}

export function BottomNav({ active, className, ...props }: BottomNavProps) {
  return (
    <nav
      aria-label="Main"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      className={cn(
        "bg-surface-default border-border-faint flex w-full shrink-0 items-start border-t px-3 pt-2",
        className,
      )}
      {...props}
    >
      {TABS.map(({ id, label, href, Icon }) => {
        const isActive = id === active;
        return (
          <Link
            key={id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-1"
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
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
