"use client";

import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/client";

/**
 * The small brand-coloured heading above a section.
 *
 * It exists because of Hindi. The English treatment is UPPERCASE with 0.04em
 * of letter-spacing, and neither of those survives the trip to Devanagari:
 * the script has no capitals, so `uppercase` does nothing, and tracking pushes
 * matras and conjuncts away from the consonants they belong to — क् + ष should
 * render as क्ष, and spacing them out makes a familiar word look misspelt.
 *
 * So Devanagari keeps the size, weight and colour and drops the two Latin-only
 * flourishes. Nothing is made smaller to accommodate it.
 */
export function SectionHeading({
  children,
  as: Tag = "h2",
  size = "subsection",
  className,
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "p";
  size?: "subsection" | "eyebrow";
  className?: string;
}) {
  const locale = useLocale();
  return (
    <Tag
      className={cn(
        size === "eyebrow" ? "text-eyebrow-label" : "text-subsection-heading",
        "text-action-primary",
        locale === "hi" ? "tracking-normal" : "uppercase tracking-[0.04em]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
