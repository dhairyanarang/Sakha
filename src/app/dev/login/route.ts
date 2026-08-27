import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Signs in as the QA account so the screens behind auth can be driven in a
 * browser — by a person or by an automated check.
 *
 * Returns 404 unless DEV_TOOLS is on, which is preview-only. The credentials
 * come from the environment and are never in the repo.
 */
export async function GET(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEV_TOOLS !== "1") {
    return new NextResponse("Not found", { status: 404 });
  }

  const email = process.env.DEV_LOGIN_EMAIL;
  const password = process.env.DEV_LOGIN_PASSWORD;
  if (!email || !password) {
    return new NextResponse("Dev login is not configured", { status: 500 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return new NextResponse(`Dev login failed: ${error.message}`, { status: 500 });
  }

  const next = request.nextUrl.searchParams.get("next");
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.redirect(new URL(safe, request.url));
}
