import type { ZodError } from 'zod';

import {
  addIntentPayloadSchema,
  commercialPayloadSchema,
  reporterPayloadSchema,
  residentPayloadSchema,
  type AddIntentPayload,
  type RegisterPayload,
} from '@/api/schemas';
import type { UserIntent } from '@/constants/registration';
import type { SignUpForm } from '@/features/signup/types';

export type PayloadResult =
  | { ok: true; payload: RegisterPayload }
  | { ok: false; errors: Record<string, string> };

export type AddIntentPayloadResult =
  | { ok: true; payload: AddIntentPayload }
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
 * The fields the form must carry before either payload can be built, checked
 * ahead of the schema so the first missing one is named in plain words.
 */
function missingField(intent: UserIntent, form: SignUpForm): Record<string, string> | null {
  if ((intent === 'RESIDENT' || intent === 'COMMERCIAL') && !form.location) {
    return { location: 'Add your location to continue.' };
  }

  if ((intent === 'RESIDENT' || intent === 'REPORTER') && !form.profile_picture) {
    return { profile_picture: 'Add a profile picture to continue.' };
  }

  if (intent === 'COMMERCIAL' && !form.business_logo) {
    return { business_logo: 'Add your business logo to continue.' };
  }

  return null;
}

/**
 * The intent-specific fields, shared by registration and by attaching a role.
 * Deliberately phone-less: registration adds the number on top, while the
 * add-role route takes it from the access token instead.
 */
function profileFields(intent: UserIntent, form: SignUpForm) {
  if (intent === 'RESIDENT') {
    return {
      intent,
      first_name: form.first_name,
      last_name: form.last_name,
      ward_kata: form.ward_kata,
      street_mtaa: form.street_mtaa,
      luku_meter: form.luku_meter,
      location: form.location,
      unit_number: form.unit_number,
      profile_picture: form.profile_picture,
    };
  }

  if (intent === 'REPORTER') {
    return {
      intent,
      first_name: form.first_name,
      last_name: form.last_name,
      profile_picture: form.profile_picture,
    };
  }

  return {
    intent,
    business_name: form.business_name,
    ward_kata: form.ward_kata,
    street_mtaa: form.street_mtaa,
    location: form.location,
    // Optional on the schema: a business without a meter omits it rather than
    // sending an empty string the pattern would reject.
    luku_meter: form.luku_meter || undefined,
    waste_tier: form.waste_tier,
    tax_id: form.tax_id,
    business_logo: form.business_logo,
  };
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
  const missing = missingField(intent, form);
  if (missing) return { ok: false, errors: missing };

  const candidate = { phone, ...profileFields(intent, form) };

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

/**
 * The same form, shaped for `POST /users/me/intents`: identical to registration
 * except the phone number is left out, because the account is identified by its
 * access token rather than by a number the payload could lie about.
 */
export function buildAddIntentPayload(
  intent: UserIntent,
  form: SignUpForm
): AddIntentPayloadResult {
  const missing = missingField(intent, form);
  if (missing) return { ok: false, errors: missing };

  const parsed = addIntentPayloadSchema.safeParse(profileFields(intent, form));

  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error) };
  }

  return { ok: true, payload: parsed.data };
}
