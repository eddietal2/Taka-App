import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { I18nProvider } from '@/features/i18n/context';
import { restoreColorSchemePreference } from '@/features/theme/color-scheme';

export default function RootLayout() {
  // A forced colour scheme only lasts for the running process, so the remembered
  // choice has to be re-applied on every launch.
  useEffect(() => {
    void restoreColorSchemePreference();
  }, []);

  return (
    <I18nProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </I18nProvider>
  );
}
