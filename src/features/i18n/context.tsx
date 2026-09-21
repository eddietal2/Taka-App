import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { TRANSLATIONS, type Language, type TranslationKey } from '@/features/i18n/translations';
import {
  loadLanguagePreference,
  saveLanguagePreference,
} from '@/features/preferences/storage';

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

/** Swahili, because the app is aimed at Tanzanian households. */
const DEFAULT_LANGUAGE: Language = 'sw';

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
 * The choice is remembered on this device so it survives a reload, and mirrored
 * onto the account so it follows the user to another one — see
 * `useAdoptAccountPreferences` for which wins. The device read is asynchronous,
 * so the first paint is always Swahili; blocking the tree on it would delay the
 * whole app to avoid a single frame of the default.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    let cancelled = false;

    void loadLanguagePreference().then((stored) => {
      if (!cancelled && stored) setLanguageState(stored);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Applies the choice immediately and remembers it here. The account's copy is
   * written by the screen the user made the choice on, which is the side that
   * holds the session token.
   */
  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    void saveLanguagePreference(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) =>
      interpolate(TRANSLATIONS[language][key], params),
    [language]
  );

  const value = useMemo<I18nContextValue>(() => ({ language, setLanguage, t }), [
    language,
    setLanguage,
    t,
  ]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside an <I18nProvider>.');
  }
  return context;
}
