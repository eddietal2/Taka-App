import type { Page, Route } from '@playwright/test';

/**
 * A stubbed Taka API for the web suite.
 *
 * The app talks to a real base URL inlined at build time, so the whole
 * `/api/v1/**` surface is intercepted here instead. Keeping the answers in one
 * mutable object means a flow can sign in, add a role and switch it, with each
 * request reflecting what the previous ones changed — the one thing a set of
 * fixed responses cannot do.
 */

export type FakeAccount = {
  id: string;
  phone: string;
  intent: 'RESIDENT' | 'REPORTER' | 'COMMERCIAL';
  status: string;
  first_name?: string;
  last_name?: string;
  business_name?: string;
  picture_url?: string;
  ward_kata?: string;
  street_mtaa?: string;
  luku_meter?: string;
  location?: { latitude: number; longitude: number };
  roles: Array<'RESIDENT' | 'REPORTER' | 'COMMERCIAL'>;
};

export const RESIDENT_ONLY: FakeAccount = {
  id: 'user-1',
  phone: '+255712345678',
  intent: 'RESIDENT',
  status: 'ACTIVE',
  first_name: 'Amina',
  last_name: 'Mwangi',
  picture_url: 'https://cdn.example.com/amina.jpg',
  ward_kata: 'Kata',
  street_mtaa: 'Mtaa',
  luku_meter: '12345678901',
  location: { latitude: -6.8, longitude: 39.2 },
  roles: ['RESIDENT'],
};

export const BOTH_ROLES: FakeAccount = { ...RESIDENT_ONLY, roles: ['RESIDENT', 'REPORTER'] };

export type FakeApi = {
  /** Every path the app has asked for, in order, for assertions about calls. */
  calls: string[];
  /** The account the next read will return, after whatever the flows changed. */
  account: FakeAccount;
};

export async function installFakeApi(page: Page, account: FakeAccount): Promise<FakeApi> {
  const api: FakeApi = { calls: [], account: { ...account, roles: [...account.roles] } };

  const json = (route: Route, status: number, body: unknown) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    api.calls.push(path);

    if (path === '/api/v1/auth/otp/request') {
      return json(route, 200, { expires_in: 300, resend_after: 30, registered: true });
    }

    if (path === '/api/v1/auth/otp/verify') {
      return json(route, 200, { verification_token: 'verification-token', expires_in: 900 });
    }

    if (path === '/api/v1/auth/login') {
      return json(route, 200, { token: 'access-token', status: 'ACTIVE', user: api.account });
    }

    if (path === '/api/v1/users/me' && method === 'GET') {
      return json(route, 200, { status: 'ACTIVE', user: api.account });
    }

    if (path === '/api/v1/users/me' && method === 'PATCH') {
      const patch = request.postDataJSON() as Partial<FakeAccount>;
      api.account = { ...api.account, ...patch };
      return json(route, 200, { status: 'ACTIVE', user: api.account });
    }

    // Attaching a role: the missing profile appears and the role becomes active.
    if (path === '/api/v1/users/me/intents' && method === 'POST') {
      const body = request.postDataJSON() as { intent: FakeAccount['intent'] };
      api.account = {
        ...api.account,
        intent: body.intent,
        roles: [...new Set([...api.account.roles, body.intent])],
      };
      return json(route, 201, { status: 'ACTIVE', user: api.account });
    }

    if (path === '/api/v1/users/me/site') {
      return json(route, 200, { status: 'ACTIVE', user: api.account });
    }

    if (path === '/api/v1/users/me/phone') {
      return json(route, 200, { status: 'ACTIVE', user: api.account });
    }

    if (path === '/api/v1/users/me' && method === 'DELETE') {
      return json(route, 200, { deleted: true });
    }

    if (path === '/api/v1/uploads/presign') {
      return json(route, 200, {
        upload_url: 'https://cdn.example.com/upload',
        public_url: 'https://cdn.example.com/uploaded.jpg',
        key: 'uploaded.jpg',
      });
    }

    if (path.startsWith('/api/v1/luku/')) {
      return json(route, 200, {
        meter_number: '12345678901',
        owner_name: 'Amina Mwangi',
        ward_kata: 'Kata',
        street_mtaa: 'Mtaa',
        location: { latitude: -6.8, longitude: 39.2 },
        confirmed: true,
      });
    }

    return json(route, 404, { message: 'Not found.' });
  });

  return api;
}

/**
 * Signs in through the real screens, against the stub.
 *
 * The language control renders endonyms, so tapping "English" works before any
 * language has been chosen — which is what makes the rest of a spec readable.
 */
export async function signIn(page: Page, account: FakeAccount): Promise<FakeApi> {
  const api = await installFakeApi(page, account);

  await page.goto('/login');
  await page.getByText('English', { exact: true }).click();
  await page.getByLabel('Phone number').fill('712345678');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Verification code').fill('123456');
  await page.getByRole('button', { name: 'Verify' }).click();
  await page.getByText('Home').waitFor();

  return api;
}

/** Moves to the Profile tab and waits for the account card to render. */
export async function openProfile(page: Page): Promise<void> {
  await page.getByText('Profile', { exact: true }).click();
  await page.getByText('Account roles').waitFor();
}
