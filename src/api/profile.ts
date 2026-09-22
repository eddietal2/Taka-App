import type { SessionUser } from '@/api/auth';
import { apiRequest } from '@/api/client';
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
