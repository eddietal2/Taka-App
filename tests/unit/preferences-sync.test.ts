import { describe, expect, it } from '@jest/globals';

import { resolvePreferences } from '@/features/preferences/sync';

describe('resolvePreferences', () => {
  it('keeps what the account already stored', () => {
    const resolved = resolvePreferences({
      accountLanguage: 'en',
      accountTheme: 'dark',
      deviceLanguage: 'sw',
      deviceTheme: 'light',
    });

    expect(resolved.language).toBe('en');
    expect(resolved.theme).toBe('dark');
    // Both were already on the account, so there is nothing to write back.
    expect(resolved.patch).toEqual({});
  });

  it('adopts the device choice when the account has none', () => {
    const resolved = resolvePreferences({
      deviceLanguage: 'en',
      deviceTheme: 'dark',
    });

    expect(resolved.language).toBe('en');
    expect(resolved.theme).toBe('dark');
    expect(resolved.patch).toEqual({ language: 'en', theme_preference: 'dark' });
  });

  it('fills only the half the account is missing', () => {
    const resolved = resolvePreferences({
      accountLanguage: 'sw',
      deviceLanguage: 'en',
      deviceTheme: 'dark',
    });

    expect(resolved.language).toBe('sw');
    expect(resolved.theme).toBe('dark');
    expect(resolved.patch).toEqual({ theme_preference: 'dark' });
  });

  it('never asks the account to change a value it holds', () => {
    const resolved = resolvePreferences({
      accountLanguage: 'sw',
      accountTheme: 'light',
      deviceLanguage: 'en',
      deviceTheme: 'dark',
    });

    expect(resolved.patch).toEqual({});
  });
});
