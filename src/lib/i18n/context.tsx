import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { translations, type Locale, SUPPORTED_LOCALES, LOCALE_LABELS } from "./translations";

type I18nCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof translations["en"]) => string;
  locales: readonly Locale[];
  label: (l: Locale) => string;
};

const I18nContext = createContext<I18nCtx | null>(null);

function detectLocale(): Locale {
  const stored = localStorage.getItem("matango_locale") as Locale | null;
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
  const nav = navigator.language.slice(0, 2) as Locale;
  if (SUPPORTED_LOCALES.includes(nav)) return nav;
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem("matango_locale", l);
    setLocaleState(l);
  }, []);

  const t = useCallback(
    (key: keyof typeof translations["en"]) => translations[locale]?.[key] ?? translations.en[key] ?? key,
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, locales: SUPPORTED_LOCALES, label: (l) => LOCALE_LABELS[l] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
