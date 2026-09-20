import { apiRequest } from '@/api/client';
import type { CommercialPayload, ReporterPayload, ResidentPayload } from '@/api/schemas';
import type { UserIntent } from '@/constants/registration';

/** OTP endpoints served by taka-server-resident under `/api/v1`. */
const OTP_REQUEST_PATH = '/api/v1/auth/otp/request';
const OTP_VERIFY_PATH = '/api/v1/auth/otp/verify';

export type OtpRequestResponse = {
  /** Seconds until the code expires, when the API provides it. */
  expires_in?: number;
  /** Seconds to wait before allowing a resend, when the API provides it. */
  resend_after?: number;
};

export type OtpVerifyResponse = {
  /** Short-lived token proving the phone number was verified. */
  verification_token?: string;
};

export type RegisterResponse = {
  token?: string;
  status?: string;
  user?: unknown;
};

export function requestOtp(phone: string) {
  return apiRequest<OtpRequestResponse>(OTP_REQUEST_PATH, { method: 'POST', body: { phone } });
}

export function verifyOtp(phone: string, code: string) {
  return apiRequest<OtpVerifyResponse>(OTP_VERIFY_PATH, {
    method: 'POST',
    body: { phone, code },
  });
}

export function registerResident(payload: ResidentPayload, token?: string | null) {
  return apiRequest<RegisterResponse>('/api/v1/auth/register-resident', {
    method: 'POST',
    body: payload,
    token,
  });
}

export function registerReporter(payload: ReporterPayload, token?: string | null) {
  return apiRequest<RegisterResponse>('/api/v1/auth/register-reporter', {
    method: 'POST',
    body: payload,
    token,
  });
}

export function registerCommercial(payload: CommercialPayload, token?: string | null) {
  return apiRequest<RegisterResponse>('/api/v1/auth/register-commercial', {
    method: 'POST',
    body: payload,
    token,
  });
}

/** The signed-in account, as it is stored locally and shown in the app. */
export type SessionUser = {
  id: string;
  phone: string;
  intent: UserIntent;
  status: string;
  first_name?: string;
  last_name?: string;
  business_name?: string;
};

export type LoginResponse = {
  /** Absent when the account exists but has not been approved yet. */
  token?: string;
  status?: string;
  user?: SessionUser;
};

/**
 * Exchanges the short-lived verification token for a session, for an account
 * that already exists.
 *
 * The token goes in the Authorization header rather than the body: the server
 * reads the phone number from it, so a caller cannot request a session for a
 * number they have not just verified.
 */
export function login(verificationToken: string) {
  return apiRequest<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    token: verificationToken,
  });
}
