import { describe, expect, it } from '@jest/globals';

import {
    isValidTanzanianNumber,
    TANZANIA_COUNTRY_CODE,
    TANZANIA_MAX_NATIONAL_DIGITS,
    toE164,
    toNationalNumber,
} from '@/constants/phone';

describe('toNationalNumber', () => {
  it('strips the trunk zero locals type first', () => {
    expect(toNationalNumber('0712345678')).toBe('712345678');
  });

  it('strips a typed +255 country code', () => {
    expect(toNationalNumber('+255712345678')).toBe('712345678');
  });

  it('strips a country code written without the plus', () => {
    expect(toNationalNumber('255712345678')).toBe('712345678');
  });

  it('keeps a bare national number as it is', () => {
    expect(toNationalNumber('712345678')).toBe('712345678');
  });

  it('ignores spaces and punctuation', () => {
    expect(toNationalNumber('0712 345 678')).toBe('712345678');
    expect(toNationalNumber('0712-345-678')).toBe('712345678');
  });

  it('leaves an empty value empty', () => {
    expect(toNationalNumber('')).toBe('');
  });
});

describe('isValidTanzanianNumber', () => {
  it('accepts the mobile ranges that begin with 6 or 7', () => {
    expect(isValidTanzanianNumber('712345678')).toBe(true);
    expect(isValidTanzanianNumber('612345678')).toBe(true);
  });

  it('accepts the forms a user is likely to type', () => {
    expect(isValidTanzanianNumber('0712345678')).toBe(true);
    expect(isValidTanzanianNumber('+255712345678')).toBe(true);
  });

  it('rejects a number that is too short or too long', () => {
    expect(isValidTanzanianNumber('71234567')).toBe(false);
    expect(isValidTanzanianNumber('7123456789')).toBe(false);
  });

  it('rejects a national number that does not start with 6 or 7', () => {
    expect(isValidTanzanianNumber('512345678')).toBe(false);
    expect(isValidTanzanianNumber('0123456789')).toBe(false);
  });

  it('rejects input with no digits', () => {
    expect(isValidTanzanianNumber('')).toBe(false);
    expect(isValidTanzanianNumber('not a phone')).toBe(false);
  });
});

describe('toE164', () => {
  it('formats a national number in full international form', () => {
    expect(toE164('712345678')).toBe('+255712345678');
  });

  it('normalises a locally written number before prefixing', () => {
    expect(toE164('0712 345 678')).toBe('+255712345678');
  });

  it('does not double up a country code that is already there', () => {
    expect(toE164('+255712345678')).toBe('+255712345678');
  });

  it('builds on the exported country code', () => {
    expect(toE164('712345678').startsWith(TANZANIA_COUNTRY_CODE)).toBe(true);
  });
});

describe('national input limits', () => {
  it('allows the nine digits plus the trunk zero locals type', () => {
    expect(TANZANIA_MAX_NATIONAL_DIGITS).toBe(10);
  });
});
