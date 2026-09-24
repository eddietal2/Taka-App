import { describe, expect, it } from '@jest/globals';

import type { SessionUser } from '@/api/auth';
import { USER_INTENTS, type UserIntent } from '@/constants/registration';
import {
    addableRoles,
    hasRole,
    ROLE_ADD_LABEL_KEYS,
    ROLE_SWITCH_LABEL_KEYS,
    rolesOf,
} from '@/features/auth/roles';

function user(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: 'user-1',
    phone: '+255712345678',
    intent: 'RESIDENT',
    status: 'ACTIVE',
    ...overrides,
  };
}

describe('rolesOf', () => {
  it('has no roles without an account', () => {
    expect(rolesOf(null)).toEqual([]);
    expect(rolesOf(undefined)).toEqual([]);
  });

  it('falls back to the active role for a session cached before roles existed', () => {
    expect(rolesOf(user({ intent: 'REPORTER' }))).toEqual(['REPORTER']);
  });

  it('prefers the roles the server sent', () => {
    const both = user({ intent: 'REPORTER', roles: ['RESIDENT', 'REPORTER'] });
    expect(rolesOf(both)).toEqual(['RESIDENT', 'REPORTER']);
  });

  it('falls back when the server sends an empty list', () => {
    expect(rolesOf(user({ intent: 'RESIDENT', roles: [] }))).toEqual(['RESIDENT']);
  });
});

describe('hasRole', () => {
  it('is true for the active role only', () => {
    const resident = user({ intent: 'RESIDENT', roles: ['RESIDENT'] });

    expect(hasRole(resident, 'RESIDENT')).toBe(true);
    expect(hasRole(resident, 'REPORTER')).toBe(false);
  });

  it('is true for a role the account holds but is not using', () => {
    const both = user({ intent: 'REPORTER', roles: ['RESIDENT', 'REPORTER'] });
    expect(hasRole(both, 'RESIDENT')).toBe(true);
  });

  it('is false without an account', () => {
    expect(hasRole(null, 'RESIDENT')).toBe(false);
  });
});

describe('addableRoles', () => {
  it('offers the other personal role to a resident', () => {
    expect(addableRoles(user({ intent: 'RESIDENT' }))).toEqual(['REPORTER']);
  });

  it('offers the other personal role to a reporter', () => {
    expect(addableRoles(user({ intent: 'REPORTER' }))).toEqual(['RESIDENT']);
  });

  it('offers nothing once both are held', () => {
    const both = user({ intent: 'RESIDENT', roles: ['RESIDENT', 'REPORTER'] });
    expect(addableRoles(both)).toEqual([]);
  });

  it('does not offer a role the account already holds', () => {
    const roles = addableRoles(user({ intent: 'REPORTER', roles: ['REPORTER'] }));
    expect(roles).not.toContain('REPORTER');
  });

  it('offers nothing without an account', () => {
    expect(addableRoles(null)).toEqual([]);
  });
});

describe('role copy', () => {
  it('names every role it can switch to or add', () => {
    for (const intent of USER_INTENTS) {
      expect(ROLE_SWITCH_LABEL_KEYS[intent as UserIntent]).toBeTruthy();
      expect(ROLE_ADD_LABEL_KEYS[intent as UserIntent]).toBeTruthy();
    }
  });
});
