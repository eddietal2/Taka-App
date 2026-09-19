import type { ZodError } from 'zod';

import {
    commercialPayloadSchema,
    reporterPayloadSchema,
    residentPayloadSchema,
    type RegisterPayload,
} from '@/api/schemas';
import type { UserIntent } from '@/constants/registration';
import type { SignUpForm } from '@/features/signup/types';

export type PayloadResult =
  | { ok: true; payload: RegisterPayload }
  | { ok: false; errors: Record<string, string> };

function toFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : 'form';
    errors[key] ??= issue.message;
  }
  return errors;
}

/**
 * Shapes the flat form into the exact payload for the chosen intent and
 * validates it against the shared schema.
 */
export function buildRegisterPayload(
  intent: UserIntent,
  phone: string,
  form: SignUpForm
): PayloadResult {
  if (intent === 'RESIDENT' || intent === 'COMMERCIAL') {
    if (!form.location) {
      return { ok: false, errors: { location: 'Add your location to continue.' } };
    }
  }

  if (intent === 'RESIDENT' || intent === 'REPORTER') {
    if (!form.profile_picture) {
      return { ok: false, errors: { profile_picture: 'Add a profile picture to continue.' } };
    }
  }

  if (intent === 'COMMERCIAL' && !form.business_logo) {
    return { ok: false, errors: { business_logo: 'Add your business logo to continue.' } };
  }

  const candidate =
    intent === 'RESIDENT'
      ? {
          phone,
          intent,
          first_name: form.first_name,
          last_name: form.last_name,
          ward_kata: form.ward_kata,
          street_mtaa: form.street_mtaa,
          luku_meter: form.luku_meter,
          location: form.location,
          unit_number: form.unit_number,
          profile_picture: form.profile_picture,
        }
      : intent === 'REPORTER'
        ? {
            phone,
            intent,
            first_name: form.first_name,
            last_name: form.last_name,
            profile_picture: form.profile_picture,
          }
        : {
            phone,
            intent,
            business_name: form.business_name,
            ward_kata: form.ward_kata,
            street_mtaa: form.street_mtaa,
            location: form.location,
            waste_tier: form.waste_tier,
            tax_id: form.tax_id,
            business_logo: form.business_logo,
          };

  const parsed =
    intent === 'RESIDENT'
      ? residentPayloadSchema.safeParse(candidate)
      : intent === 'REPORTER'
        ? reporterPayloadSchema.safeParse(candidate)
        : commercialPayloadSchema.safeParse(candidate);

  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error) };
  }

  return { ok: true, payload: parsed.data };
}
