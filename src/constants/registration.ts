/**
 * Registration domain constants shared by the sign-up flow and the API layer.
 */

import type { TranslationKey } from '@/features/i18n/translations';

export const USER_INTENTS = ['RESIDENT', 'REPORTER', 'COMMERCIAL'] as const;
export type UserIntent = (typeof USER_INTENTS)[number];

/**
 * Waste tiers accepted by the commercial registration endpoint.
 *
 * Mirrored in taka-server-resident/src/schemas/auth.ts, which validates the
 * value with `z.enum`, so the two lists have to be changed together or the
 * register call is rejected. The column is a plain string, so adding a tier
 * needs no migration.
 */
export const WASTE_TIERS = [
  'LOW_VOLUME_WEEKLY',
  'MEDIUM_VOLUME_TWICE_WEEKLY',
  'HIGH_VOLUME_DAILY',
] as const;
export type WasteTier = (typeof WASTE_TIERS)[number];

export const WASTE_TIER_LABEL_KEYS: Record<WasteTier, TranslationKey> = {
  LOW_VOLUME_WEEKLY: 'wasteTier.lowVolumeWeekly',
  MEDIUM_VOLUME_TWICE_WEEKLY: 'wasteTier.mediumVolumeTwiceWeekly',
  HIGH_VOLUME_DAILY: 'wasteTier.highVolumeDaily',
};

/**
 * Presentation copy for each account type, held as translation keys rather than
 * text so one map serves every language. `needsLocation` stays a plain flag
 * because it drives routing, not wording.
 */
export type IntentCopy = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  /** Label for the image captured in the photo step. */
  imageLabelKey: TranslationKey;
  /** Whether this intent needs a GPS location. */
  needsLocation: boolean;
};

export const INTENT_COPY: Record<UserIntent, IntentCopy> = {
  RESIDENT: {
    titleKey: 'intent.resident.title',
    descriptionKey: 'intent.resident.description',
    imageLabelKey: 'intent.resident.imageLabel',
    needsLocation: true,
  },
  REPORTER: {
    titleKey: 'intent.reporter.title',
    descriptionKey: 'intent.reporter.description',
    imageLabelKey: 'intent.reporter.imageLabel',
    needsLocation: false,
  },
  COMMERCIAL: {
    titleKey: 'intent.commercial.title',
    descriptionKey: 'intent.commercial.description',
    imageLabelKey: 'intent.commercial.imageLabel',
    needsLocation: true,
  },
};
