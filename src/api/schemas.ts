import { z } from 'zod';

import { WASTE_TIERS } from '@/constants/registration';

export const TANZANIA_PHONE_PATTERN = /^\+255\d{9}$/;
export const LUKU_METER_PATTERN = /^\d{11}$/;
export const TAX_ID_PATTERN = /^\d{3}-\d{3}-\d{3}$/;

export const geoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof geoPointSchema>;

const phoneSchema = z
  .string()
  .regex(TANZANIA_PHONE_PATTERN, 'Use the +255XXXXXXXXX format.');
const nameSchema = z.string().trim().min(2, 'Too short.').max(60, 'Too long.');
const localitySchema = z.string().trim().min(2, 'Required.').max(80, 'Too long.');
const imageUrlSchema = z.string().trim().min(1, 'Required.');

export const residentPayloadSchema = z.object({
  phone: phoneSchema,
  intent: z.literal('RESIDENT'),
  first_name: nameSchema,
  last_name: nameSchema,
  ward_kata: localitySchema,
  street_mtaa: localitySchema,
  luku_meter: z.string().regex(LUKU_METER_PATTERN, 'LUKU meters are 11 digits.'),
  location: geoPointSchema,
  unit_number: z.string().trim().max(60, 'Too long.'),
  profile_picture: imageUrlSchema,
});

export const reporterPayloadSchema = z.object({
  phone: phoneSchema,
  intent: z.literal('REPORTER'),
  first_name: nameSchema,
  last_name: nameSchema,
  profile_picture: imageUrlSchema,
});

export const commercialPayloadSchema = z.object({
  phone: phoneSchema,
  intent: z.literal('COMMERCIAL'),
  business_name: z.string().trim().min(2, 'Required.').max(120, 'Too long.'),
  ward_kata: localitySchema,
  street_mtaa: localitySchema,
  location: geoPointSchema,
  /**
   * A business may share or lack a meter, so this is optional — but when the
   * sign-up lookup confirmed one, the reference is kept on the profile.
   */
  luku_meter: z.string().regex(LUKU_METER_PATTERN, 'LUKU meters are 11 digits.').optional(),
  waste_tier: z.enum(WASTE_TIERS),
  tax_id: z.string().regex(TAX_ID_PATTERN, 'Use the 123-456-789 format.'),
  business_logo: imageUrlSchema,
});

export const registerPayloadSchema = z.discriminatedUnion('intent', [
  residentPayloadSchema,
  reporterPayloadSchema,
  commercialPayloadSchema,
]);

export type ResidentPayload = z.infer<typeof residentPayloadSchema>;
export type ReporterPayload = z.infer<typeof reporterPayloadSchema>;
export type CommercialPayload = z.infer<typeof commercialPayloadSchema>;
export type RegisterPayload = z.infer<typeof registerPayloadSchema>;
