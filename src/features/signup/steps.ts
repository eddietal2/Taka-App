import { INTENT_COPY, type UserIntent } from '@/constants/registration';

/** Total steps in the longest flow (the success screen is excluded). */
export const SIGN_UP_TOTAL_STEPS = 7;

export const SIGN_UP_STEPS = {
  intent: 1,
  phone: 2,
  verify: 3,
  details: 4,
  location: 5,
  photo: 6,
  review: 7,
} as const;

/**
 * Screen position and total for `step`.
 *
 * Reporters never pin a location, so their run is one step shorter and the
 * numbers after `location` shift down by one to keep the counter gapless. A
 * `null` intent (before an account type is chosen) keeps the full count.
 */
export function signUpProgress(
  intent: UserIntent | null,
  step: number
): { step: number; totalSteps: number } {
  const skipsLocation = intent !== null && !INTENT_COPY[intent].needsLocation;

  return {
    step: skipsLocation && step > SIGN_UP_STEPS.location ? step - 1 : step,
    totalSteps: skipsLocation ? SIGN_UP_TOTAL_STEPS - 1 : SIGN_UP_TOTAL_STEPS,
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

/** First screen after the details form: pin a location only where it is needed. */
export function postDetailsRouteFor(intent: UserIntent): '/sign-up/location' | '/sign-up/photo' {
  return INTENT_COPY[intent].needsLocation ? '/sign-up/location' : '/sign-up/photo';
}
