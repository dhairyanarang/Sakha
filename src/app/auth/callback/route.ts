import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMemberships } from "@/lib/account";
import { setLocaleCookie } from "@/lib/i18n/set-locale";

/**
 * Google hands back a code here; we swap it for a session.
 *
 * `next` is validated as a same-origin path. Reflecting an arbitrary
 * ?next= into a redirect is an open-redirect, which is exactly the shape of
 * phishing link people fall for.
 */
const AFTER_SIGNIN_COOKIE = "sakha_after_signin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  /**
   * Where they were headed before Google.
   *
   * Two sources, same rule. The query string is the documented contract and
   * still honoured; the cookie is what the sign-in button actually sets,
   * because redirect_to has to keep matching Supabase's allow list exactly.
   *
   * Either way it must be a path on this site — reflecting an arbitrary URL
   * here would be an open redirect on the one endpoint every sign-in passes
   * through.
   */
  const store = await cookies();
  const fromCookie = store.get(AFTER_SIGNIN_COOKIE)?.value;
  const rawNext = searchParams.get("next") ?? (fromCookie ? decodeURIComponent(fromCookie) : null);
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=sign_in_failed`);
  }

  // Someone returning already has an account; a new user still needs a name.
  const memberships = await getMemberships();

  // Sign-in is the one moment this device can be holding the wrong language —
  // a new phone, or cleared site data. The account row is the durable answer,
  // so re-seed the cookie from it before rendering anything.
  //
  // Only from an account they OWN. A family member has no language row of
  // their own; falling back to the account they can view would have re-seeded
  // them into HER language on every sign-in, quietly undoing the choice they
  // made on their own Profile. Theirs lives in the cookie, so it is left alone.
  const own = memberships.find((m) => m.role === "owner");
  if (own) await setLocaleCookie(own.language);

  if (fromCookie) store.delete(AFTER_SIGNIN_COOKIE);

  if (next) return NextResponse.redirect(`${origin}${next}`);

  return NextResponse.redirect(
    `${origin}${memberships.length > 0 ? "/" : "/onboarding/name"}`,
  );
}
