/**
 * TIN (tax identification number) input helpers.
 *
 * A TIN is nine digits written as three groups — `100-234-567` — and the server
 * validates that same shape (`TAX_ID_PATTERN` in `@/api/schemas`).
 */

export const TAX_ID_DIGITS = 9;

/** The nine digits plus the two separators. */
export const TAX_ID_MAX_LENGTH = TAX_ID_DIGITS + 2;

/**
 * Formats digits into the TIN pattern as they are typed, e.g. `100234567`
 * becomes `100-234-567`.
 *
 * The dashes are added for the user because the field opens a numeric keypad,
 * which has no dash key — typing the separators by hand was impossible, so the
 * pattern could never be satisfied. Partial input is grouped too, so the dashes
 * appear as the user goes rather than only once all nine digits are in.
 */
export function formatTaxId(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, TAX_ID_DIGITS);

  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
    .filter((part) => part.length > 0)
    .join('-');
}
