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
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and the PWA files, which need no session.
    "/((?!_next/static|_next/image|favicon.ico|icons/|apple-icon.png|manifest.webmanifest|sw.js).*)",
  ],
};
