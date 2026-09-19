/**
 * Shared design tokens.
 *
 * Deliberately minimal placeholders — swap the palette once a full brand
 * system is defined. Screens resolve the active palette with:
 *
 *   const theme = getPalette(useColorScheme());
 */

/**
 * Brand colors are the same across appearances:
 *   primary   #5CB178  (green)
 *   secondary #42596B  (slate blue)
 * `onPrimary` / `onSecondary` are the foreground colors to use on top of them.
 */
export const palette = {
  light: {
    background: '#FFFFFF',
    surface: '#F4F5F7',
    border: '#E2E4E8',
    text: '#11181C',
    textMuted: '#6B7280',
    primary: '#5CB178',
    onPrimary: '#FFFFFF',
    secondary: '#42596B',
    onSecondary: '#FFFFFF',
    danger: '#DC2626',
  },
  dark: {
    background: '#0B0D0E',
    surface: '#161819',
    border: '#2A2D2F',
    text: '#ECEDEE',
    textMuted: '#9BA1A6',
    primary: '#5CB178',
    onPrimary: '#FFFFFF',
    secondary: '#42596B',
    onSecondary: '#FFFFFF',
    danger: '#F87171',
  },
} as const;

export type ThemePalette = { [K in keyof typeof palette.light]: string };

/**
 * Resolves the active palette. Accepts the value returned by
 * `useColorScheme()`, which may be `'light'`, `'dark'`, `'unspecified'` or `null`.
 */
export function getPalette(scheme?: string | null): ThemePalette {
  return scheme === 'dark' ? palette.dark : palette.light;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;
