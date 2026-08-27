"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Keeps <meta name="theme-color"> in step with the current screen.
 *
 * iOS reads the manifest's theme_color once at launch, so a per-route value
 * declared in metadata never reaches an installed app. Rewriting the tag
 * directly is what actually repaints the status bar — indigo on Home so it
 * continues the header gradient, page colour everywhere else.
 *
 * Purely a DOM side effect, which is exactly what an effect is for.
 */
const HOME = "#5551FF"; // brand/500 — the gradient's starting colour
const REST = "#F1F1FF"; // surface/tinted — the light strip onboarding wants

export function ThemeColor() {
  const pathname = usePathname();

  useEffect(() => {
    const colour = pathname === "/" ? HOME : REST;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "theme-color";
      document.head.appendChild(tag);
    }
    tag.content = colour;
  }, [pathname]);

  return null;
}
