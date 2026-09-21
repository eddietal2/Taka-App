import { useCallback } from 'react';
import { useColorScheme } from 'react-native';

import type { SessionUser } from '@/api/auth';
import { updateAccount } from '@/api/profile';
import { useI18n } from '@/features/i18n/context';
import { resolvePreferences } from '@/features/preferences/sync';
import {
    applyColorScheme,
    CAN_FORCE_SCHEME,
    type ColorSchemePreference,
} from '@/features/theme/color-scheme';

/**
 * Aligns this device with the account that has just signed in.
 *
 * Called from the two places a session is created — signing in, and completing
 * registration — because each is the first moment the account's stored
 * preferences are known. On a fresh account there is nothing stored, so the
 * device's own choice is pushed up instead, which is how a preference picked
 * before signing up survives.
 *
 * The account write is best-effort: the device has already been corrected, and a
 * network failure should not turn a successful sign-in into an error.
 */
export function useAdoptAccountPreferences() {
  const { language, setLanguage } = useI18n();
  const scheme = useColorScheme();

  return useCallback(
    async (user: SessionUser, token: string) => {
      const deviceTheme: ColorSchemePreference = scheme === 'dark' ? 'dark' : 'light';

      const resolved = resolvePreferences({
        accountLanguage: user.language,
        accountTheme: user.theme_preference,
        deviceLanguage: language,
        deviceTheme,
      });

      if (resolved.language !== language) {
        setLanguage(resolved.language);
      }

      // Only write the device cache when the scheme actually differs, so a
      // redundant write cannot race with the user reaching the toggle.
      if (CAN_FORCE_SCHEME && resolved.theme !== deviceTheme) {
        applyColorScheme(resolved.theme);
      }

      if (Object.keys(resolved.patch).length === 0) return;

      try {
        await updateAccount(resolved.patch, token);
      } catch {
        // The device is already showing the right thing; the account catches up
        // the next time a preference is changed.
      }
    },
    [language, scheme, setLanguage]
  );
}
