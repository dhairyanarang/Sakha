/**
 * Next inlines process.env only at literal member access, so these have to be
 * written out rather than looked up dynamically. Validating here means a
 * missing key fails loudly at startup instead of as a confusing 401 later.
 *
 * Both are publishable, browser-safe values. The service_role/secret key must
 * never appear in a NEXT_PUBLIC_ variable — that ships it to every visitor.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function supabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
        "Run `vercel env pull .env.local` to fetch them.",
    );
  }
  return { url: SUPABASE_URL, key: SUPABASE_PUBLISHABLE_KEY };
}
