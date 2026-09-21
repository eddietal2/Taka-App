import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Language } from '@/features/i18n/translations';
import type { ColorSchemePreference } from '@/features/theme/color-scheme';

/**
 * The device's copy of the two display preferences.
 *
 * These exist so the choice survives a reload and applies before any network
 * call. The account holds the authoritative copy — see
 * `useAdoptAccountPreferences` — and this is the cache a fresh install seeds an
 * account from.
 */
const LANGUAGE_KEY = 'taka.pref.language';
const THEME_KEY = 'taka.pref.theme';

/**
 * SecureStore has no web implementation, so the browser keeps the choice in
 * memory for the session, the same arrangement the auth token uses.
 */
let memoryLanguage: string | null = null;
let memoryTheme: string | null = null;

function isLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'sw';
}

function isTheme(value: string | null): value is ColorSchemePreference {
  return value === 'light' || value === 'dark';
}

export async function loadLanguagePreference(): Promise<Language | null> {
  const stored =
    Platform.OS === 'web' ? memoryLanguage : await SecureStore.getItemAsync(LANGUAGE_KEY);
  return isLanguage(stored) ? stored : null;
}

export async function saveLanguagePreference(language: Language): Promise<void> {
  memoryLanguage = language;
  if (Platform.OS === 'web') return;
  await SecureStore.setItemAsync(LANGUAGE_KEY, language);
}

export async function loadThemePreference(): Promise<ColorSchemePreference | null> {
  const stored = Platform.OS === 'web' ? memoryTheme : await SecureStore.getItemAsync(THEME_KEY);
  return isTheme(stored) ? stored : null;
}

export async function saveThemePreference(scheme: ColorSchemePreference): Promise<void> {
  memoryTheme = scheme;
  if (Platform.OS === 'web') return;
  await SecureStore.setItemAsync(THEME_KEY, scheme);
}
