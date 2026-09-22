import type { SessionUser } from '@/api/auth';
import { apiRequest } from '@/api/client';
import type { GeoPoint } from '@/api/schemas';
import type { Language } from '@/features/i18n/translations';
import type { ColorSchemePreference } from '@/features/theme/color-scheme';

export type UpdateAccountResponse = {
  /** Present when the API returns the account's approval state. */
  status?: string;
  /** The stored account, which is the authority on every field it carries. */
  user?: SessionUser;
};

/** Only the fields the app changes. Anything omitted is left as it was. */
export type AccountPatch = {
  /** A URL the presign route already minted, not image bytes. */
  picture_url?: string;
  language?: Language;
  theme_preference?: ColorSchemePreference;
  /** Personal name, for a resident or reporter. */
  first_name?: string;
  last_name?: string;
  /** Business name. The server accepts this only for a commercial account. */
  business_name?: string;
};

/**
 * Applies a partial update to the signed-in account.
 *
 * Needs the access token rather than the verification token the presign route
 * also accepts: by the time anyone is changing a preference, sign-up is long
 * over and that short-lived token is gone.
 */
export function updateAccount(patch: AccountPatch, token: string) {
  return apiRequest<UpdateAccountResponse>('/api/v1/users/me', {
    method: 'PATCH',
    body: patch,
    token,
  });
}

/**
 * Moves the account onto a different phone number.
 *
 * The new number must already have been verified: `verificationToken` is the
 * one-time proof `otp/verify` issued for it, and the server reads the number
 * from that token rather than trusting the one sent alongside it. The access
 * token stays the caller's, because this acts on the account behind it.
 */
export function changePhone(phone: string, verificationToken: string, accessToken: string) {
  return apiRequest<UpdateAccountResponse>('/api/v1/users/me/phone', {
    method: 'POST',
    body: { phone, verification_token: verificationToken },
    token: accessToken,
  });
}

/** The service address fields of an account: its pin, its locality and its meter. */
export type SitePatch = {
  ward_kata: string;
  street_mtaa: string;
  location: GeoPoint;
  /**
   * The meter the account should end up on. Omit it to keep the current one; an
   * empty string detaches the meter, which only a commercial account may do.
   */
  luku_meter?: string;
};

/**
 * Updates the service address, the meter, or both in one call.
 *
 * They travel together because the server writes the address onto the meter
 * record as well as the profile, which is what keeps a future sign-up for that
 * meter seeded with the right address instead of a stale one.
 */
export function updateSite(site: SitePatch, token: string) {
  return apiRequest<UpdateAccountResponse>('/api/v1/users/me/site', {
    method: 'POST',
    body: site,
    token,
  });
}

/**
 * Reads the signed-in account from the server.
 *
 * The stored session is what the app signed in with; the address and meter are
 * edited elsewhere and can move on without it, so a screen that shows them asks
 * for the server's copy rather than trusting the cache.
 */
export function fetchAccount(token: string) {
  return apiRequest<UpdateAccountResponse>('/api/v1/users/me', { token });
}

export type DeleteAccountResponse = {
  deleted?: boolean;
};

/**
 * Deletes the signed-in account.
 *
 * The server removes the account and everything the profile owns. The LUKU meter
 * number is released rather than deleted: it stays on file with its address, so
 * it can be registered again by a new account. The caller is expected to clear
 * the local session afterwards.
 */
export function deleteAccount(token: string) {
  return apiRequest<DeleteAccountResponse>('/api/v1/users/me', {
    method: 'DELETE',
    token,
  });
}
