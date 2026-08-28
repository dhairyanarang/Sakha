"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, messagesFor, type Locale, type Messages } from ".";

/**
 * The language, handed down once from the root layout.
 *
 * Client components read it from context rather than taking a prop, so adding
 * a translated string to a component five levels down does not mean threading
 * a `locale` prop through five parents that have no use for it.
 *
 * The dictionary itself is not carried across the network — both languages are
 * already in the bundle, and Hindi is a few kilobytes. Only the two-letter
 * locale crosses the boundary.
 */
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** The dictionary, in a client component. */
export function useT(): Messages {
  return messagesFor(useContext(LocaleContext));
}

/** Both, for a component that also formats a date or a number. */
export function useI18n(): { t: Messages; locale: Locale } {
  const locale = useContext(LocaleContext);
  return { t: messagesFor(locale), locale };
}
