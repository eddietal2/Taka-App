import { describe, expect, it } from '@jest/globals';

import { buildAddIntentPayload, buildRegisterPayload } from '@/features/signup/build-payload';
import { EMPTY_SIGN_UP_FORM, type SignUpForm } from '@/features/signup/types';

const PHONE = '+255712345678';

const residentForm: SignUpForm = {
  ...EMPTY_SIGN_UP_FORM,
  first_name: 'Amina',
  last_name: 'Mwangi',
  ward_kata: 'Kata',
  street_mtaa: 'Mtaa',
  luku_meter: '12345678901',
  location: { latitude: -6.8, longitude: 39.2 },
  profile_picture: 'https://cdn.example.com/a.jpg',
};

const reporterForm: SignUpForm = {
  ...EMPTY_SIGN_UP_FORM,
  first_name: 'Juma',
  last_name: 'Ali',
  profile_picture: 'https://cdn.example.com/a.jpg',
};

const commercialForm: SignUpForm = {
  ...EMPTY_SIGN_UP_FORM,
  business_name: 'Taka Ltd',
  ward_kata: 'Kata',
  street_mtaa: 'Mtaa',
  location: { latitude: -6.8, longitude: 39.2 },
  waste_tier: 'HIGH_VOLUME_DAILY',
  tax_id: '123-456-789',
  business_logo: 'https://cdn.example.com/logo.jpg',
};

describe('buildRegisterPayload', () => {
  it('builds a resident payload carrying the phone number', () => {
    const result = buildRegisterPayload('RESIDENT', PHONE, residentForm);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.intent).toBe('RESIDENT');
      expect(result.payload.phone).toBe(PHONE);
    }
  });

  it('builds a reporter payload from the minimal form', () => {
    expect(buildRegisterPayload('REPORTER', PHONE, reporterForm).ok).toBe(true);
  });

  it('builds a commercial payload', () => {
    expect(buildRegisterPayload('COMMERCIAL', PHONE, commercialForm).ok).toBe(true);
  });

  it('names a missing location before the schema does', () => {
    const result = buildRegisterPayload('RESIDENT', PHONE, { ...residentForm, location: null });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.location).toBeTruthy();
  });

  it('names a missing personal picture', () => {
    const result = buildRegisterPayload('REPORTER', PHONE, {
      ...reporterForm,
      profile_picture: null,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.profile_picture).toBeTruthy();
  });

  it('names a missing business logo', () => {
    const result = buildRegisterPayload('COMMERCIAL', PHONE, {
      ...commercialForm,
      business_logo: null,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.business_logo).toBeTruthy();
  });

  it('reports a malformed meter against its field', () => {
    const result = buildRegisterPayload('RESIDENT', PHONE, {
      ...residentForm,
      luku_meter: '123',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.luku_meter).toBeTruthy();
  });
});

describe('buildAddIntentPayload', () => {
  it('builds a reporter profile with no phone number in it', () => {
    const result = buildAddIntentPayload('REPORTER', reporterForm);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.intent).toBe('REPORTER');
      expect('phone' in result.payload).toBe(false);
    }
  });

  it('builds a resident profile with no phone number in it', () => {
    const result = buildAddIntentPayload('RESIDENT', residentForm);

    expect(result.ok).toBe(true);
    if (result.ok) expect('phone' in result.payload).toBe(false);
  });

  it('applies the same field checks as registration', () => {
    const result = buildAddIntentPayload('REPORTER', { ...reporterForm, profile_picture: null });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.profile_picture).toBeTruthy();
  });

  it('reports a malformed meter against its field', () => {
    const result = buildAddIntentPayload('RESIDENT', { ...residentForm, luku_meter: '123' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.luku_meter).toBeTruthy();
  });

  it('refuses a commercial profile, which the endpoint does not yet attach', () => {
    expect(buildAddIntentPayload('COMMERCIAL', commercialForm).ok).toBe(false);
  });
});
