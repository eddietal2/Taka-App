import type { UserIntent } from '@/constants/registration';

/** Total steps when nothing is skipped (the success screen is excluded). */
export const SIGN_UP_TOTAL_STEPS = 8;

/**
 * Order of the flow: the meter is resolved first, the pin is then dropped on
 * that meter's address, and only afterwards are the personal details collected —
 * so the ward and street can be pre-filled from the pin rather than typed twice.
 */
export const SIGN_UP_STEPS = {
  intent: 1,
  phone: 2,
  verify: 3,
  luku: 4,
  location: 5,
  details: 6,
  photo: 7,
  review: 8,
} as const;

/**
 * Steps an account type never visits. Reporters have no meter and pin nothing,
 * so both middle steps are dropped; residents and commercial accounts walk the
 * same path.
 */
function skippedSteps(intent: UserIntent): readonly number[] {
  if (intent === 'REPORTER') return [SIGN_UP_STEPS.luku, SIGN_UP_STEPS.location];
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

/** The type-specific details page for each account type. */
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
 * Screen that follows phone verification. Residents and commercial accounts
 * resolve their LUKU meter first; reporters have none and go straight to the
 * details form.
 */
export function postVerifyRouteFor(intent: UserIntent): '/sign-up/luku' | '/sign-up/reporter' {
  return intent === 'REPORTER' ? '/sign-up/reporter' : '/sign-up/luku';
}

/** First screen after the details form: every account type adds an image next. */
export function postDetailsRouteFor(_intent: UserIntent): '/sign-up/photo' {
  return '/sign-up/photo';
}
