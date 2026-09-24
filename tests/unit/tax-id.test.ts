import { describe, expect, it } from '@jest/globals';

import { formatTaxId, TAX_ID_DIGITS, TAX_ID_MAX_LENGTH } from '@/constants/tax-id';

describe('formatTaxId', () => {
  it('groups nine digits into the three-part TIN pattern', () => {
    expect(formatTaxId('100234567')).toBe('100-234-567');
  });

  it('drops anything that is not a digit', () => {
    expect(formatTaxId('100-234-567')).toBe('100-234-567');
    expect(formatTaxId('100 234 567')).toBe('100-234-567');
  });

  it('groups partial input as the user types', () => {
    expect(formatTaxId('1')).toBe('1');
    expect(formatTaxId('100')).toBe('100');
    expect(formatTaxId('1002')).toBe('100-2');
    expect(formatTaxId('100234')).toBe('100-234');
  });

  it('stops accepting digits past the ninth', () => {
    expect(formatTaxId('1002345678')).toBe('100-234-567');
  });

  it('returns an empty string for input with no digits', () => {
    expect(formatTaxId('')).toBe('');
    expect(formatTaxId('---')).toBe('');
  });
});

describe('TIN length constants', () => {
  it('describes nine digits plus the two separators', () => {
    expect(TAX_ID_DIGITS).toBe(9);
    expect(TAX_ID_MAX_LENGTH).toBe(11);
  });
});
