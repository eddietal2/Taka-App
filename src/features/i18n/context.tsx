import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { TRANSLATIONS, type Language, type TranslationKey } from '@/features/i18n/translations';

/** Values substituted into `{placeholder}` tokens in a translation. */
export type TranslationParams = Record<string, string | number>;

/** Resolves a key against the active language, filling any `{placeholders}`. */
export type Translator = (key: TranslationKey, params?: TranslationParams) => string;

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translator;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const PLACEHOLDER = /\{(\w+)\}/g;

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;

  // An unknown placeholder is left as-is rather than blanked, so a typo shows
  // up in the UI instead of silently dropping the value.
  return template.replace(PLACEHOLDER, (match, name: string) =>
    params[name] === undefined ? match : String(params[name])
  );
}

/**
 * Holds the active language for the whole app.
 *
 * The choice lives in memory only, so it resets on a reload; persisting it
 * alongside the auth token would be the next step if it needs to stick.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) =>
      interpolate(TRANSLATIONS[language][key], params),
    [language]
  );

  const value = useMemo<I18nContextValue>(() => ({ language, setLanguage, t }), [language, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside an <I18nProvider>.');
  }
  return context;
}
