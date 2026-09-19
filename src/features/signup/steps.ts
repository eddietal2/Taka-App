import { INTENT_COPY, type UserIntent } from '@/constants/registration';

/** Total steps when nothing is skipped (the success screen is excluded). */
export const SIGN_UP_TOTAL_STEPS = 8;

export const SIGN_UP_STEPS = {
  intent: 1,
  phone: 2,
  verify: 3,
  details: 4,
  luku: 5,
  location: 6,
  photo: 7,
  review: 8,
} as const;

/**
 * Steps an account type never visits. Reporters skip both the meter and the
 * pin; commercial accounts have no meter, so only the pin remains.
 */
function skippedSteps(intent: UserIntent): readonly number[] {
  if (intent === 'REPORTER') return [SIGN_UP_STEPS.luku, SIGN_UP_STEPS.location];
  if (intent === 'COMMERCIAL') return [SIGN_UP_STEPS.luku];
  return [];
}

/**
 * Screen position and total for `step`, with skipped steps closed up so the
 * counter never jumps (a reporter's photo step reads 5 of 6, not 7 of 8). A
 * `null` intent (before an account type is chosen) keeps the full count.
 */
export function signUpProgress(
  intent: UserIntent | null,
  step: number
): { step: number; totalSteps: number } {
  const skipped = intent ? skippedSteps(intent) : [];

  return {
    step: step - skipped.filter((skippedStep) => skippedStep < step).length,
    totalSteps: SIGN_UP_TOTAL_STEPS - skipped.length,
  };
}

/** The type-specific "first page" for each account type. */
export const INTENT_DETAILS_ROUTES = {
  RESIDENT: '/sign-up/resident',
  REPORTER: '/sign-up/reporter',
  COMMERCIAL: '/sign-up/commercial',
} as const;

export type IntentDetailsRoute = (typeof INTENT_DETAILS_ROUTES)[UserIntent];

export function detailsRouteFor(intent: UserIntent): IntentDetailsRoute {
  return INTENT_DETAILS_ROUTES[intent];
}

/**
 * First screen after the details form: residents give their meter number,
 * commercial accounts pin a location, reporters only need a photo.
 */
export function postDetailsRouteFor(
  intent: UserIntent
): '/sign-up/luku' | '/sign-up/location' | '/sign-up/photo' {
  if (intent === 'RESIDENT') return '/sign-up/luku';
  return INTENT_COPY[intent].needsLocation ? '/sign-up/location' : '/sign-up/photo';
}
