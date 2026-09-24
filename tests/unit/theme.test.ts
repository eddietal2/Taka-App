import { describe, expect, it } from '@jest/globals';

import { fontSize, getPalette, palette, radius, spacing } from '@/constants/theme';

describe('getPalette', () => {
  it('returns the dark palette only for the dark scheme', () => {
    expect(getPalette('dark')).toBe(palette.dark);
  });

  it('falls back to the light palette for everything else', () => {
    // `useColorScheme()` can hand back null or a platform-specific string, so
    // anything that is not exactly "dark" has to resolve to light.
    expect(getPalette('light')).toBe(palette.light);
    expect(getPalette(null)).toBe(palette.light);
    expect(getPalette(undefined)).toBe(palette.light);
    expect(getPalette('unspecified')).toBe(palette.light);
  });
});

describe('palette', () => {
  it('carries the same keys in both appearances', () => {
    expect(Object.keys(palette.dark).sort()).toEqual(Object.keys(palette.light).sort());
  });

  it('keeps the brand colours identical across appearances', () => {
    expect(palette.dark.primary).toBe(palette.light.primary);
    expect(palette.dark.secondary).toBe(palette.light.secondary);
    expect(palette.dark.onPrimary).toBe(palette.light.onPrimary);
  });
});

describe('scale tokens', () => {
  it('increases spacing as the names get larger', () => {
    expect(spacing.xs).toBeLessThan(spacing.sm);
    expect(spacing.sm).toBeLessThan(spacing.md);
    expect(spacing.md).toBeLessThan(spacing.lg);
    expect(spacing.lg).toBeLessThan(spacing.xl);
    expect(spacing.xl).toBeLessThan(spacing.xxl);
  });

  it('increases type size as the names get larger', () => {
    expect(fontSize.xs).toBeLessThan(fontSize.sm);
    expect(fontSize.sm).toBeLessThan(fontSize.md);
    expect(fontSize.md).toBeLessThan(fontSize.lg);
    expect(fontSize.lg).toBeLessThan(fontSize.xl);
  });

  it('uses a pill radius big enough to round any control', () => {
    expect(radius.pill).toBeGreaterThan(radius.lg);
  });
});
