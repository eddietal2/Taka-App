import { Appearance, Platform } from 'react-native';

import { loadThemePreference, saveThemePreference } from '@/features/preferences/storage';

/**
 * Whether the app can override the system colour scheme.
 *
 * react-native-web implements only `getColorScheme`/`addChangeListener`, not the
 * setter, so there is nothing to bind to in a browser — screens show the control
 * as absent rather than as a dead button.
 */
export const CAN_FORCE_SCHEME = Platform.OS !== 'web';

export type ColorSchemePreference = 'light' | 'dark';

/**
 * Forces the app's colour scheme and remembers it on this device.
 *
 * `useColorScheme()` reports the forced value from then on, so every
 * `getPalette(useColorScheme())` in the app repaints without any further wiring —
 * no theme provider and no per-screen plumbing. The account's copy is written
 * separately, by whichever screen the user made the choice on.
 */
export function applyColorScheme(scheme: ColorSchemePreference): void {
  Appearance.setColorScheme(scheme);
  void saveThemePreference(scheme);
}

/**
 * Re-applies the remembered choice at launch.
 *
 * `Appearance.setColorScheme` only lasts for the running process, so without
 * this the app would open on the system scheme and swap the moment the user
 * reached a screen that read the stored value.
 */
export async function restoreColorSchemePreference(): Promise<void> {
  if (!CAN_FORCE_SCHEME) return;

  const stored = await loadThemePreference();
  if (stored) {
    Appearance.setColorScheme(stored);
  }
}
