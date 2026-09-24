import { describe, expect, it } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';

import {
    loadLanguagePreference,
    loadThemePreference,
    saveLanguagePreference,
    saveThemePreference,
} from '@/features/preferences/storage';

/** The keys the storage module writes to, for corrupt-data cases. */
const LANGUAGE_KEY = 'taka.pref.language';
const THEME_KEY = 'taka.pref.theme';

describe('language preference', () => {
  it('round-trips the chosen language', async () => {
    await saveLanguagePreference('en');
    expect(await loadLanguagePreference()).toBe('en');
  });

  it('round-trips the other language too', async () => {
    await saveLanguagePreference('sw');
    expect(await loadLanguagePreference()).toBe('sw');
  });

  it('ignores a stored value the app does not ship', async () => {
    // A language written by a future build, or corrupted, must not reach the
    // translator as an unknown key set.
    await SecureStore.setItemAsync(LANGUAGE_KEY, 'fr');

    expect(await loadLanguagePreference()).toBeNull();
  });

  it('has no preference before one is saved', async () => {
    expect(await loadLanguagePreference()).toBeNull();
  });
});

describe('theme preference', () => {
  it('round-trips the chosen appearance', async () => {
    await saveThemePreference('dark');
    expect(await loadThemePreference()).toBe('dark');
  });

  it('ignores a stored value the app cannot force', async () => {
    await SecureStore.setItemAsync(THEME_KEY, 'sepia');

    expect(await loadThemePreference()).toBeNull();
  });

  it('has no preference before one is saved', async () => {
    expect(await loadThemePreference()).toBeNull();
  });
});
