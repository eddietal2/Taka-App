/**
 * Registration domain constants shared by the sign-up flow and the API layer.
 */

export const USER_INTENTS = ['RESIDENT', 'REPORTER', 'COMMERCIAL'] as const;
export type UserIntent = (typeof USER_INTENTS)[number];

/**
 * Waste tiers accepted by the commercial registration endpoint.
 * TODO: replace with the full list supplied by the backend.
 */
export const WASTE_TIERS = ['HIGH_VOLUME_DAILY'] as const;
export type WasteTier = (typeof WASTE_TIERS)[number];

export const WASTE_TIER_LABELS: Record<WasteTier, string> = {
  HIGH_VOLUME_DAILY: 'High volume — daily collection',
};

export type IntentCopy = {
  title: string;
  description: string;
  /** Label for the image captured in the media step. */
  imageLabel: string;
  /** Whether this intent needs a GPS location. */
  needsLocation: boolean;
};

export const INTENT_COPY: Record<UserIntent, IntentCopy> = {
  RESIDENT: {
    title: 'Resident',
    description: 'A household using Taka for waste collection.',
    imageLabel: 'Profile picture',
    needsLocation: true,
  },
  REPORTER: {
    title: 'Reporter',
    description: 'Report issues and illegal dumping in your area.',
    imageLabel: 'Profile picture',
    needsLocation: false,
  },
  COMMERCIAL: {
    title: 'Commercial',
    description: 'A business or institution with scheduled collections.',
    imageLabel: 'Business logo',
    needsLocation: true,
  },
};
