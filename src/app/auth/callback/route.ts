import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMemberships } from "@/lib/account";

/**
 * Google hands back a code here; we swap it for a session.
 *
 * `next` is validated as a same-origin path. Reflecting an arbitrary
 * ?next= into a redirect is an open-redirect, which is exactly the shape of
 * phishing link people fall for.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=sign_in_failed`);
  }

  if (next) return NextResponse.redirect(`${origin}${next}`);

  // Someone returning already has an account; a new user still needs a name.
  const memberships = await getMemberships();
  return NextResponse.redirect(
    `${origin}${memberships.length > 0 ? "/" : "/onboarding/name"}`,
  );
}
