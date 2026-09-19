/**
 * Tanzanian phone-number helpers.
 *
 * Tanzania's country code is `+255` and mobile numbers are 9 digits starting
 * with 6 or 7. Locals commonly write them with a leading 0 (e.g. `0712 345 678`),
 * so everything here normalises to the 9-digit national form.
 */

export const TANZANIA_COUNTRY_CODE = '+255';

/** 9 digits beginning with 6 or 7 — the Tanzanian mobile ranges. */
export const TANZANIA_NATIONAL_PATTERN = /^[67]\d{8}$/;

/**
 * Normalises user input to the 9-digit national number.
 * Accepts `0712 345 678`, `712 345 678`, `+255 712 345 678` and `255712345678`.
 */
export function toNationalNumber(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('255')) {
    digits = digits.slice(3);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

export function isValidTanzanianNumber(value: string): boolean {
  return TANZANIA_NATIONAL_PATTERN.test(toNationalNumber(value));
}

/** Formats a number in full international form, e.g. `+255712345678`. */
export function toE164(value: string): string {
  return `${TANZANIA_COUNTRY_CODE}${toNationalNumber(value)}`;
}
