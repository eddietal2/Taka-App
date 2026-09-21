import type { AccountPatch } from '@/api/profile';
import type { Language } from '@/features/i18n/translations';
import type { ColorSchemePreference } from '@/features/theme/color-scheme';

export type PreferenceResolution = {
  /** What the app should display. */
  language: Language;
  theme: ColorSchemePreference;
  /** What the account has to be told. Empty when it already held both values. */
  patch: AccountPatch;
};

export type PreferenceInputs = {
  accountLanguage?: Language;
  accountTheme?: ColorSchemePreference;
  deviceLanguage: Language;
  deviceTheme: ColorSchemePreference;
};

/**
 * Decides which preference wins when an account signs in.
 *
 * The account is the durable store and the device is the cache, so a stored
 * value always wins — that is what makes a choice follow someone to a new
 * device. Where the account has nothing, which covers a new registration and any
 * account created before these fields existed, the device's own choice is
 * adopted and sent back up. Without that second half, a language picked during
 * sign-up would be silently dropped at the moment of registration.
 *
 * Pure, so the merge rule can be reasoned about and tested without a device.
 */
export function resolvePreferences(input: PreferenceInputs): PreferenceResolution {
  const language = input.accountLanguage ?? input.deviceLanguage;
  const theme = input.accountTheme ?? input.deviceTheme;

  const patch: AccountPatch = {};
  if (!input.accountLanguage) patch.language = language;
  if (!input.accountTheme) patch.theme_preference = theme;

  return { language, theme, patch };
}
