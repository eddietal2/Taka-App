import { expect, test } from '@playwright/test';

import { RESIDENT_ONLY, openProfile, signIn } from './fake-api';

test.describe('adding a Reporter role', () => {
  test('offers the missing role and attaches it', async ({ page }) => {
    const api = await signIn(page, RESIDENT_ONLY);
    await openProfile(page);

    // Only one role is held, so there is something to add and nothing to switch.
    await expect(page.getByRole('button', { name: 'Add Reporter account' })).toBeVisible();
    await expect(page.getByText('Switch')).toBeHidden();

    await page.getByRole('button', { name: 'Add Reporter account' }).click();

    // The details form opens pre-filled with the account's name, which is shared
    // between roles rather than asked for again.
    await expect(page.getByText('Your details')).toBeVisible();
    await expect(page.getByLabel('First name')).toHaveValue('Amina');
    await expect(page.getByLabel('Last name')).toHaveValue('Mwangi');
    await page.getByRole('button', { name: 'Continue' }).click();

    // The photo step is seeded with the account's picture, so Continue reaches the
    // review with no upload and no skip dialog.
    await page.getByRole('button', { name: 'Continue' }).click();

    // The review is worded for adding a role, not creating an account.
    await expect(page.getByText('Add your Reporter account')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add this role' })).toBeVisible();

    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Add this role' }).click();

    // Attached through the add-role endpoint, and the account now holds both.
    expect(api.calls).toContain('/api/v1/users/me/intents');
    await expect(page.getByText('Account roles')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch to Resident' })).toBeVisible();
  });
});
