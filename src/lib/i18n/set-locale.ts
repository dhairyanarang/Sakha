import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale, type Locale } from ".";

/**
 * Mirror the chosen language into the cookie the whole app renders from.
 *
 * Called wherever `accounts.language` is written — the onboarding language
 * step and the Profile chips — and at sign-in, which is the one moment a
 * device can be holding a stale copy (a new phone, or cleared site data).
 *
 * Only ever called from a Server Action or a Route Handler; Next does not
 * allow a cookie to be set during a render, which is exactly why the database
 * stays the durable answer and this is only a fast local copy of it.
 */
export async function setLocaleCookie(value: string): Promise<Locale | null> {
  if (!isLocale(value)) return null;
  const store = await cookies();
  store.set(LOCALE_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return value;
}
