import { beforeEach, describe, expect, it } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';

import type { SessionUser } from '@/api/auth';
import {
    clearSession,
    clearToken,
    getSessionUser,
    getToken,
    saveSessionUser,
    saveToken,
} from '@/features/auth/session';

/** The key the session module stores the account under, for corrupt-data cases. */
const USER_KEY = 'taka.auth.user';

const ACCOUNT: SessionUser = {
  id: 'user-1',
  phone: '+255712345678',
  intent: 'RESIDENT',
  status: 'ACTIVE',
  first_name: 'Amina',
  last_name: 'Mwangi',
  roles: ['RESIDENT'],
};

beforeEach(async () => {
  await clearSession();
});

describe('auth token', () => {
  it('round-trips a token', async () => {
    await saveToken('access-token');
    expect(await getToken()).toBe('access-token');
  });

  it('has no token before one is saved', async () => {
    expect(await getToken()).toBeNull();
  });

  it('clears a token', async () => {
    await saveToken('access-token');
    await clearToken();
    expect(await getToken()).toBeNull();
  });
});

describe('session account', () => {
  it('round-trips the account alongside its token', async () => {
    await saveSessionUser(ACCOUNT);
    expect(await getSessionUser()).toEqual(ACCOUNT);
  });

  it('has no account before one is saved', async () => {
    expect(await getSessionUser()).toBeNull();
  });

  it('treats a corrupt record as signed out rather than crashing', async () => {
    // A record written by an older version could be unparseable; the app must
    // fall back to "no session" instead of throwing on launch.
    await SecureStore.setItemAsync(USER_KEY, '{not json');

    expect(await getSessionUser()).toBeNull();
  });

  it('keeps the roles the server sent through the round trip', async () => {
    const both: SessionUser = { ...ACCOUNT, intent: 'REPORTER', roles: ['RESIDENT', 'REPORTER'] };
    await saveSessionUser(both);

    expect((await getSessionUser())?.roles).toEqual(['RESIDENT', 'REPORTER']);
  });
});

describe('clearSession', () => {
  it('clears both halves of the session', async () => {
    await saveToken('access-token');
    await saveSessionUser(ACCOUNT);

    await clearSession();

    expect(await getToken()).toBeNull();
    expect(await getSessionUser()).toBeNull();
  });
});
