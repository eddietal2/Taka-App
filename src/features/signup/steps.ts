import type { UserIntent } from '@/constants/registration';

/** Total steps shown in the progress bar (the success screen is excluded). */
export const SIGN_UP_TOTAL_STEPS = 6;

export const SIGN_UP_STEPS = {
  intent: 1,
  phone: 2,
  verify: 3,
  details: 4,
  media: 5,
  review: 6,
} as const;

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
