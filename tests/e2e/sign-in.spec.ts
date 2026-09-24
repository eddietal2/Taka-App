import { expect, test } from '@playwright/test';

import { installFakeApi, RESIDENT_ONLY, signIn } from './fake-api';

test.describe('sign in', () => {
  test('refuses an invalid number without asking the server for a code', async ({ page }) => {
    const api = await installFakeApi(page, RESIDENT_ONLY);

    await page.goto('/login');
    await page.getByText('English', { exact: true }).click();

    await page.getByLabel('Phone number').fill('123');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Enter a valid Tanzanian mobile number.')).toBeVisible();
    expect(api.calls).not.toContain('/api/v1/auth/otp/request');
  });

  test('signs in and lands on Home', async ({ page }) => {
    const api = await signIn(page, RESIDENT_ONLY);

    // The code was requested and verified, then traded for a session.
    expect(api.calls).toContain('/api/v1/auth/otp/request');
    expect(api.calls).toContain('/api/v1/auth/otp/verify');
    expect(api.calls).toContain('/api/v1/auth/login');
    await expect(page.getByText('Home')).toBeVisible();
  });

  test('reports a rejected code and stays on the verify step', async ({ page }) => {
    const api = await installFakeApi(page, RESIDENT_ONLY);
    await page.unroute('**/api/v1/**');
    await page.route('**/api/v1/auth/otp/verify', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'That code is incorrect. Check it and try again.' }),
      })
    );

    await page.goto('/login');
    await page.getByText('English', { exact: true }).click();
    await page.getByLabel('Phone number').fill('712345678');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Verification code').fill('000000');
    await page.getByRole('button', { name: 'Verify' }).click();

    await expect(
      page.getByText('That code is incorrect. Check it and try again.')
    ).toBeVisible();
    expect(api.calls).not.toContain('/api/v1/auth/login');
  });
});
