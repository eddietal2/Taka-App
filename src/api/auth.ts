import { apiRequest } from '@/api/client';
import type { CommercialPayload, ReporterPayload, ResidentPayload } from '@/api/schemas';

/**
 * TODO: confirm the OTP endpoint paths with the backend — these follow the
 * `/api/v1/auth/*` convention used by the register endpoints.
 */
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
