import { describe, expect, it } from '@jest/globals';

import {
    addIntentPayloadSchema,
    commercialPayloadSchema,
    registerPayloadSchema,
    reporterPayloadSchema,
    residentPayloadSchema,
} from '@/api/schemas';

const residentPayload = {
  phone: '+255712345678',
  intent: 'RESIDENT' as const,
  first_name: 'Amina',
  last_name: 'Mwangi',
  ward_kata: 'Kata',
  street_mtaa: 'Mtaa',
  luku_meter: '12345678901',
  location: { latitude: -6.8, longitude: 39.2 },
  unit_number: '',
  profile_picture: 'https://cdn.example.com/a.jpg',
};

const commercialPayload = {
  phone: '+255712345678',
  intent: 'COMMERCIAL' as const,
  business_name: 'Taka Ltd',
  ward_kata: 'Kata',
  street_mtaa: 'Mtaa',
  location: { latitude: -6.8, longitude: 39.2 },
  waste_tier: 'HIGH_VOLUME_DAILY' as const,
  tax_id: '123-456-789',
  business_logo: 'https://cdn.example.com/logo.jpg',
};

describe('residentPayloadSchema', () => {
  it('accepts the shape the app builds', () => {
    expect(residentPayloadSchema.safeParse(residentPayload).success).toBe(true);
  });

  it('rejects a meter that is not eleven digits', () => {
    expect(residentPayloadSchema.safeParse({ ...residentPayload, luku_meter: '123' }).success).toBe(
      false
    );
  });

  it('rejects a location outside the globe', () => {
    expect(
      residentPayloadSchema.safeParse({
        ...residentPayload,
        location: { latitude: 120, longitude: 39.2 },
      }).success
    ).toBe(false);
  });

  it('accepts an empty street and unit, which the form allows', () => {
    expect(
      residentPayloadSchema.safeParse({ ...residentPayload, street_mtaa: '', unit_number: '' })
        .success
    ).toBe(true);
  });

  it('rejects a local-format phone the app should have normalised', () => {
    expect(residentPayloadSchema.safeParse({ ...residentPayload, phone: '0712345678' }).success).toBe(
      false
    );
  });
});

describe('reporterPayloadSchema', () => {
  it('accepts a minimal reporter payload', () => {
    expect(
      reporterPayloadSchema.safeParse({
        phone: '+255712345678',
        intent: 'REPORTER',
        first_name: 'Juma',
        last_name: 'Ali',
        profile_picture: 'https://cdn.example.com/a.jpg',
      }).success
    ).toBe(true);
  });

  it('requires a picture', () => {
    expect(
      reporterPayloadSchema.safeParse({
        phone: '+255712345678',
        intent: 'REPORTER',
        first_name: 'Juma',
        last_name: 'Ali',
      }).success
    ).toBe(false);
  });
});

describe('commercialPayloadSchema', () => {
  it('accepts the shape the app builds', () => {
    expect(commercialPayloadSchema.safeParse(commercialPayload).success).toBe(true);
  });

  it('holds the TIN to the 123-456-789 format', () => {
    expect(commercialPayloadSchema.safeParse({ ...commercialPayload, tax_id: '123456789' }).success).toBe(
      false
    );
  });

  it('rejects a waste tier outside the accepted list', () => {
    expect(commercialPayloadSchema.safeParse({ ...commercialPayload, waste_tier: 'LOW' }).success).toBe(
      false
    );
  });
});

describe('registerPayloadSchema', () => {
  it('discriminates on the account type', () => {
    expect(registerPayloadSchema.safeParse(residentPayload).success).toBe(true);
    expect(registerPayloadSchema.safeParse(commercialPayload).success).toBe(true);
    expect(
      registerPayloadSchema.safeParse({ ...residentPayload, intent: 'UNKNOWN' }).success
    ).toBe(false);
  });
});

describe('addIntentPayloadSchema', () => {
  it('accepts the profile registration collects, without a phone', () => {
    const { phone: _phone, ...profile } = residentPayload;

    expect(addIntentPayloadSchema.safeParse(profile).success).toBe(true);
  });

  it('drops a phone number, which the access token owns', () => {
    const result = addIntentPayloadSchema.safeParse(residentPayload);

    expect(result.success).toBe(true);
    if (result.success) expect('phone' in result.data).toBe(false);
  });

  it('still holds the meter to the eleven-digit rule', () => {
    expect(
      addIntentPayloadSchema.safeParse({ ...residentPayload, luku_meter: '123' }).success
    ).toBe(false);
  });

  it('refuses a role the API cannot attach', () => {
    // Commercial joins this union only once the app offers a business role.
    expect(addIntentPayloadSchema.safeParse(commercialPayload).success).toBe(false);
    expect(addIntentPayloadSchema.safeParse({ ...residentPayload, intent: 'UNKNOWN' }).success).toBe(
      false
    );
  });
});
