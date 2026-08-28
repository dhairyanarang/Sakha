import { cache } from "react";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  messagesFor,
  type Locale,
  type Messages,
} from ".";

/**
 * Which language to render in, on the server.
 *
 * Read from a cookie rather than from `accounts.language`, deliberately. The
 * root layout needs the language on EVERY request, including the signed-out
 * ones, and going to Mumbai for it would put a database round trip in front of
 * the welcome screen. The cookie is a local, synchronous copy.
 *
 * `accounts.language` remains the durable answer. The cookie is written
 * wherever the answer changes — the onboarding language step, the Profile
 * chips — and re-synced from the database at sign-in, which is the one moment
 * a device can hold a stale copy (a new phone, or cleared site data).
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

/** The dictionary for this request. Server components call this. */
export async function getMessages(): Promise<Messages> {
  return messagesFor(await getLocale());
}

/** Both at once, for the common case of needing the locale to format a date. */
export async function getT(): Promise<{ t: Messages; locale: Locale }> {
  const locale = await getLocale();
  return { t: messagesFor(locale), locale };
}
