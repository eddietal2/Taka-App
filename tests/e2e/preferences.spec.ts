import { expect, test } from '@playwright/test';

import { RESIDENT_ONLY, openProfile, signIn } from './fake-api';

test.describe('display preferences', () => {
  test('changes the language and applies it immediately', async ({ page }) => {
    await signIn(page, RESIDENT_ONLY);
    await openProfile(page);

    await page.getByText('Kiswahili', { exact: true }).click();
    // The label follows the choice, which is the confirmation.
    await expect(page.getByText('Lugha')).toBeVisible();

    await page.getByText('English', { exact: true }).click();
    await expect(page.getByText('Language')).toBeVisible();
  });
});
