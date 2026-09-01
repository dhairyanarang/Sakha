/**
 * Where a pushed screen goes when you press Back.
 *
 * Detail screens are shared: the same measurement history opens from her
 * Health screen and from a family member's Family View, and each has to send
 * you back where you came from. The origin travels as ?from=<path> and is
 * read here rather than guessed from the viewer's role — role would get the
 * screen right and still lose the day being viewed.
 *
 * Only ever a path on this site. Reflecting an arbitrary value into a link is
 * the shape of an open redirect, and these paths end up in an href on a screen
 * people reach from links other people send them. Same rule the auth callback
 * already applies to its own next parameter.
 */
export function safeReturnTo(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
