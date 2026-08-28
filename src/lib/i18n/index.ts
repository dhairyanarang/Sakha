import { en } from "./messages/en";
import { hi } from "./messages/hi";

/**
 * Two languages, one dictionary shape.
 *
 * Sakha needs English and Hindi and nothing else, so there is no i18n library
 * here — no bundle, no key parser, no runtime lookup that can miss. A message
 * is a property on a plain object, and anything that varies (a name, a count,
 * a medicine) is a function that takes it.
 *
 * `en` defines the type; `hi` is declared as that type. So a message added in
 * English and forgotten in Hindi is a BUILD ERROR, not a stray English word
 * discovered on her phone. That is the whole audit mechanism, and it is why
 * the dictionary is worth more than a set of `t("some.key")` strings.
 */
export type Messages = typeof en;

export const LOCALES = ["en", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** The cookie the whole app reads its language from. */
export const LOCALE_COOKIE = "sakha_lang";

const DICTIONARIES: Record<Locale, Messages> = { en, hi };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function messagesFor(locale: Locale): Messages {
  return DICTIONARIES[locale];
}

/** What each language calls itself. Never translated — a name is a name. */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
};
