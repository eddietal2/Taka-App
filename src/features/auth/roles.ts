import type { SessionUser } from '@/api/auth';
import type { UserIntent } from '@/constants/registration';
import type { TranslationKey } from '@/features/i18n/translations';

/**
 * Roles an account may still take on.
 *
 * Resident and Reporter for now. The helpers below are role-agnostic — the server
 * already derives whichever profiles exist — but only these two are offered while
 * a business role has no screen of its own to add one from.
 */
export const ADDABLE_INTENTS = ['RESIDENT', 'REPORTER'] as const;

export type AddableIntent = (typeof ADDABLE_INTENTS)[number];

/**
 * The roles an account holds.
 *
 * The server sends `roles` on every account it returns. A session cached before
 * the field existed falls back to the single active `intent`, which is what such
 * an account necessarily had.
 */
export function rolesOf(user: SessionUser | null | undefined): UserIntent[] {
  if (!user) return [];
  return user.roles && user.roles.length > 0 ? user.roles : [user.intent];
}

export function hasRole(user: SessionUser | null | undefined, intent: UserIntent): boolean {
  return rolesOf(user).includes(intent);
}

/** Roles the account does not hold yet, in the order the app offers them. */
export function addableRoles(user: SessionUser | null | undefined): AddableIntent[] {
  const held = rolesOf(user);
  return ADDABLE_INTENTS.filter((intent) => !held.includes(intent));
}

/**
 * Copy for the Profile role rows, held as translation keys so one map serves
 * every language. Keyed by the role named, not by the active one, so a row reads
 * "Switch to Reporter" whichever role the account is currently used in.
 */
export const ROLE_SWITCH_LABEL_KEYS: Record<UserIntent, TranslationKey> = {
  RESIDENT: 'profile.switchToResident',
  REPORTER: 'profile.switchToReporter',
  COMMERCIAL: 'profile.switchToCommercial',
};

export const ROLE_ADD_LABEL_KEYS: Record<UserIntent, TranslationKey> = {
  RESIDENT: 'profile.addResident',
  REPORTER: 'profile.addReporter',
  COMMERCIAL: 'profile.addCommercial',
};
