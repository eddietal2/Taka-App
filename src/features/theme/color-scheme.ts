import { Appearance, Platform } from 'react-native';

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
 * Forces the app's colour scheme.
 *
 * `useColorScheme()` reports the forced value from then on, so every
 * `getPalette(useColorScheme())` in the app repaints without any further wiring —
 * no theme provider and no per-screen plumbing.
 */
export function applyColorScheme(scheme: ColorSchemePreference): void {
  Appearance.setColorScheme(scheme);
}
