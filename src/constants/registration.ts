/**
 * Registration domain constants shared by the sign-up flow and the API layer.
 */

import type { TranslationKey } from '@/features/i18n/translations';

export const USER_INTENTS = ['RESIDENT', 'REPORTER', 'COMMERCIAL'] as const;
export type UserIntent = (typeof USER_INTENTS)[number];

/**
 * Waste tiers accepted by the commercial registration endpoint.
 * TODO: replace with the full list supplied by the backend.
 */
export const WASTE_TIERS = ['HIGH_VOLUME_DAILY'] as const;
export type WasteTier = (typeof WASTE_TIERS)[number];

export const WASTE_TIER_LABEL_KEYS: Record<WasteTier, TranslationKey> = {
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
