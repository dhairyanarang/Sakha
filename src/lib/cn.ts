import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Our type scale uses custom `text-*` names (text-body-primary, …) which
 * collide with tailwind-merge's text-COLOR group by default — it would
 * silently drop one when both are present. Registering the 13 real Figma text
 * styles as font sizes keeps size and colour as independent, overridable groups.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "screen-title",
            "section-label",
            "subsection-heading",
            "body-primary",
            "body-medium",
            "body-secondary",
            "metadata",
            "eyebrow-label",
            "nav-label",
            "chip-label",
            "button-label",
            "value-display",
            "value-display-large",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
