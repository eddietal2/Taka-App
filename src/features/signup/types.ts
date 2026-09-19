import type { GeoPoint } from '@/api/schemas';
import type { WasteTier } from '@/constants/registration';

/**
 * Form state collected across the sign-up steps, before it is shaped into a
 * payload. Kept flat so every step can bind to it without narrowing a union;
 * the strict per-intent shape is enforced when the payload is built.
 */
export type SignUpForm = {
  first_name: string;
  last_name: string;
  business_name: string;
  ward_kata: string;
  street_mtaa: string;
  luku_meter: string;
  unit_number: string;
  waste_tier: WasteTier | '';
  tax_id: string;
  location: GeoPoint | null;
  /** Public S3 URL, set after the image is uploaded. */
  profile_picture: string | null;
  /** Public S3 URL, set after the logo is uploaded. */
  business_logo: string | null;
};

export const EMPTY_SIGN_UP_FORM: SignUpForm = {
  first_name: '',
  last_name: '',
  business_name: '',
  ward_kata: '',
  street_mtaa: '',
  luku_meter: '',
  unit_number: '',
  waste_tier: '',
  tax_id: '',
  location: null,
  profile_picture: null,
  business_logo: null,
};
