import { describe, expect, it } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import { ThemeToggle } from '@/components/theme-toggle';
import { I18nProvider } from '@/features/i18n/context';

/** The key the device copy of the appearance preference is stored under. */
const THEME_KEY = 'taka.pref.theme';

describe('ThemeToggle', () => {
  it('names the scheme it would switch to', async () => {
    // The moon appears while the app is light, so the label offers dark mode.
    const { getByLabelText } = await render(
      <I18nProvider>
        <ThemeToggle />
      </I18nProvider>
    );

    expect(getByLabelText('Badilisha kwenda hali ya giza')).toBeTruthy();
  });

  it('remembers the new appearance on the device', async () => {
    const { getByRole } = await render(
      <I18nProvider>
        <ThemeToggle />
      </I18nProvider>
    );

    fireEvent.press(getByRole('button'));

    // The account's copy is written by the screen; this is the device's cache,
    // which is what lets the choice survive a reload.
    await expect(SecureStore.setItemAsync).toHaveBeenCalledWith(THEME_KEY, 'dark');
  });
});
