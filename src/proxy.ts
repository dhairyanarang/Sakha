import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/supabase/env";

/**
 * Refreshes the Supabase session on every request.
 *
 * In Next 16 this file is `proxy.ts` (formerly `middleware.ts`) and must
 * export a function named `proxy` or a default.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = supabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() revalidates the token against Supabase. getSession() only reads
  // the cookie and will happily return a forged one — never trust it here.
  const { data } = await supabase.auth.getUser();

  /**
   * Signed out, asking for Home.
   *
   * requireAccount() in the page would send them to Welcome too, and for every
   * other route it still does. But Home now has a streaming boundary — the
   * shell and the splash are flushed before the page runs — and once bytes
   * have gone out, a redirect can no longer be a status code. Next falls back
   * to a meta refresh, so the signed-out launch fetched a document it threw
   * away and waited up to a second to leave it.
   *
   * Deciding it here costs nothing: getUser() has already been awaited above,
   * so this adds no query and no round trip. It is deliberately only the
   * signed-out case and only "/" — every other reason to leave Home
   * (onboarding, a family member, the wrong active account) still belongs to
   * requireAccount, which knows about accounts and this does not.
   *
   * A signed-IN request falls straight through and keeps the early first paint.
   */
  if (!data.user && request.nextUrl.pathname === "/") {
    const away = NextResponse.redirect(new URL("/welcome", request.url));
    // Carry over anything the session refresh above wanted to write, or the
    // redirect would drop a cookie clearance on the floor.
    for (const cookie of response.cookies.getAll()) away.cookies.set(cookie);
    return away;
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and the PWA files, which need no session.
    "/((?!_next/static|_next/image|favicon.ico|icons/|apple-icon.png|manifest.webmanifest|sw.js).*)",
  ],
};
