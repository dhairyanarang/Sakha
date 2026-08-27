import Link from "next/link";

/**
 * The "+ Add Document" / "+ Add Medicine" tile.
 *
 * NOT the Tertiary button, though it is close: Tertiary is a white fill with
 * an 18px Medium label, where this is drawn on surface/page with a 16px label.
 * The Design MD lists this "+Add" treatment as a planned Button variant that
 * was never actually built, so it lives here until it exists in Figma —
 * flagged rather than forced into the nearest variant.
 */
export function AddTile({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="bg-surface-page border-action-primary text-action-primary active:bg-surface-tinted flex h-[60px] w-full items-center justify-center rounded-xl border text-[16px] leading-[1.2] font-medium transition-colors"
    >
      {children}
    </Link>
  );
}
