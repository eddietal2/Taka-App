import { describe, expect, it } from '@jest/globals';

import {
    detailsRouteFor,
    INTENT_DETAILS_ROUTES,
    postDetailsRouteFor,
    postVerifyRouteFor,
    SIGN_UP_STEPS,
    SIGN_UP_TOTAL_STEPS,
    signUpProgress,
} from '@/features/signup/steps';

describe('signUpProgress', () => {
  it('counts the full flow before an account type is chosen', () => {
    expect(signUpProgress(null, SIGN_UP_STEPS.intent)).toEqual({
      step: 1,
      totalSteps: SIGN_UP_TOTAL_STEPS,
    });
  });

  it('walks residents through every step', () => {
    expect(signUpProgress('RESIDENT', SIGN_UP_STEPS.luku)).toEqual({
      step: 4,
      totalSteps: SIGN_UP_TOTAL_STEPS,
    });
    expect(signUpProgress('RESIDENT', SIGN_UP_STEPS.review)).toEqual({
      step: 8,
      totalSteps: SIGN_UP_TOTAL_STEPS,
    });
  });

  it('closes up the meter and location steps a reporter never sees', () => {
    // The reporter details step is the sixth screen but the fourth they reach.
    expect(signUpProgress('REPORTER', SIGN_UP_STEPS.details)).toEqual({ step: 4, totalSteps: 6 });
    expect(signUpProgress('REPORTER', SIGN_UP_STEPS.photo)).toEqual({ step: 5, totalSteps: 6 });
    expect(signUpProgress('REPORTER', SIGN_UP_STEPS.review)).toEqual({ step: 6, totalSteps: 6 });
  });

  it('closes up the account-creation screens for an add-role run', () => {
    // Attaching a reporter starts at the details form and reads 1 of 3.
    expect(signUpProgress('REPORTER', SIGN_UP_STEPS.details, { addRole: true })).toEqual({
      step: 1,
      totalSteps: 3,
    });
    expect(signUpProgress('REPORTER', SIGN_UP_STEPS.review, { addRole: true })).toEqual({
      step: 3,
      totalSteps: 3,
    });
  });

  it('keeps the meter and location steps for an add-role resident', () => {
    // A second resident role still needs its meter and pin, so only the three
    // account-creation screens are dropped: 8 - 3 = 5.
    expect(signUpProgress('RESIDENT', SIGN_UP_STEPS.luku, { addRole: true })).toEqual({
      step: 1,
      totalSteps: 5,
    });
    expect(signUpProgress('RESIDENT', SIGN_UP_STEPS.review, { addRole: true })).toEqual({
      step: 5,
      totalSteps: 5,
    });
  });
});

describe('route helpers', () => {
  it('sends each account type to its own details screen', () => {
    expect(detailsRouteFor('RESIDENT')).toBe(INTENT_DETAILS_ROUTES.RESIDENT);
    expect(detailsRouteFor('REPORTER')).toBe(INTENT_DETAILS_ROUTES.REPORTER);
    expect(detailsRouteFor('COMMERCIAL')).toBe(INTENT_DETAILS_ROUTES.COMMERCIAL);
  });

  it('skips the meter step for a reporter', () => {
    expect(postVerifyRouteFor('REPORTER')).toBe('/sign-up/reporter');
    expect(postVerifyRouteFor('RESIDENT')).toBe('/sign-up/luku');
    expect(postVerifyRouteFor('COMMERCIAL')).toBe('/sign-up/luku');
  });

  it('sends every type to the photo step after its details', () => {
    expect(postDetailsRouteFor('RESIDENT')).toBe('/sign-up/photo');
    expect(postDetailsRouteFor('REPORTER')).toBe('/sign-up/photo');
    expect(postDetailsRouteFor('COMMERCIAL')).toBe('/sign-up/photo');
  });
});
