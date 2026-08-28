import { NextResponse, type NextRequest } from "next/server";
import { getMemberships, setActiveAccount } from "@/lib/account";

/**
 * Where a tapped notification lands.
 *
 * A notification is about ONE account, and the person opening it may well be
 * looking at another — a son with his own Sakha open taps a reminder about his
 * mother. So the link carries the account, this switches to it, and only then
 * goes on to the screen.
 *
 * Three things are checked, in this order:
 *
 *   1. Signed in at all. If not, through sign-in first and back here after —
 *      the whole path is preserved, so tapping a notification cold ends up in
 *      the right place rather than on Home.
 *   2. Still a member. Access revoked between the send and the tap means the
 *      account is not theirs to open, and they go to their own Sakha instead
 *      of an error. RLS would empty the screen anyway; this keeps it honest.
 *   3. The destination is a path on this site, never a URL. Reflecting an
 *      arbitrary ?to= into a redirect is an open redirect, and a notification
 *      is exactly the kind of link people tap without reading.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ account: string }> },
) {
  const { account } = await params;
  const origin = request.nextUrl.origin;

  const raw = request.nextUrl.searchParams.get("to");
  const to = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  const memberships = await getMemberships();

  if (memberships.length === 0) {
    // Either signed out, or signed in with nothing yet. Sign-in handles both
    // and honours ?next=, so the destination survives the round trip.
    const next = `/n/${encodeURIComponent(account)}?to=${encodeURIComponent(to)}`;
    return NextResponse.redirect(`${origin}/sign-in?next=${encodeURIComponent(next)}`);
  }

  if (!memberships.some((m) => m.accountId === account)) {
    return NextResponse.redirect(`${origin}/`);
  }

  await setActiveAccount(account);
  return NextResponse.redirect(`${origin}${to}`);
}
