import { expect, test } from '@playwright/test';

import { BOTH_ROLES, openProfile, signIn } from './fake-api';

test.describe('switching the active role', () => {
  test('moves from Resident to Reporter and back', async ({ page }) => {
    await signIn(page, BOTH_ROLES);
    await openProfile(page);

    // A resident has a service address, and the card says which role is in use.
    await expect(page.getByText('Service address')).toBeVisible();
    await expect(page.getByText('Active')).toBeVisible();

    await page.getByRole('button', { name: 'Switch to Reporter' }).click();

    // The changeover is a screen of its own rather than a row that flickers.
    await expect(page.getByText('Switching account')).toBeVisible();
    await expect(page.getByText('Account roles')).toBeVisible();

    // A reporter pins nothing and holds no meter, so that row is gone.
    await expect(page.getByText('Service address')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Switch to Resident' })).toBeVisible();

    // And back, which restores the address.
    await page.getByRole('button', { name: 'Switch to Resident' }).click();
    await expect(page.getByText('Switching account')).toBeVisible();
    await expect(page.getByText('Service address')).toBeVisible();
  });
});
