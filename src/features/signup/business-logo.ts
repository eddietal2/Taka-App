import { palette } from '@/constants/theme';

/** Canvas, corner radius and type size for the generated logo, in SVG units. */
const SIZE = 512;
const RADIUS = 64;
const FONT_SIZE = 224;

/**
 * Cap height of a typical sans-serif face as a fraction of its font size.
 *
 * Used to place the baseline so the letters sit optically centred. `y` in SVG
 * positions the *baseline*, not the top of the glyphs, so anchoring it at the
 * vertical centre would hang the letters well above the middle.
 */
const CAP_HEIGHT_RATIO = 0.7;

/**
 * Advance widths for Helvetica/Arial **Bold**, in 1/1000 em.
 *
 * Needed to centre the text horizontally by geometry rather than by relying on
 * `text-anchor`, which some SVG renderers ignore — in which case the text starts
 * at the anchor instead of straddling it and lands visibly off to one side.
 * Arial and Helvetica share these metrics, and the Android fallback faces are
 * within a few percent, so a small residual error is not perceptible.
 */
const ADVANCES: Record<string, number> = {
  A: 722,
  B: 722,
  C: 722,
  D: 722,
  E: 667,
  F: 611,
  G: 778,
  H: 722,
  I: 278,
  J: 556,
  K: 722,
  L: 611,
  M: 833,
  N: 722,
  O: 778,
  P: 667,
  Q: 778,
  R: 722,
  S: 667,
  T: 611,
  U: 722,
  V: 667,
  W: 944,
  X: 667,
  Y: 667,
  Z: 611,
  '0': 556,
  '1': 556,
  '2': 556,
  '3': 556,
  '4': 556,
  '5': 556,
  '6': 556,
  '7': 556,
  '8': 556,
  '9': 556,
  '?': 611,
  ' ': 278,
};

/** Fallback for a glyph not in the table; close to the average uppercase width. */
const DEFAULT_ADVANCE = 700;

const CENTRE = SIZE / 2;
const BASELINE_Y = Math.round(CENTRE + (FONT_SIZE * CAP_HEIGHT_RATIO) / 2);

/** Rendered width of `value` at `FONT_SIZE`, from the advance widths above. */
function textWidth(value: string): number {
  let em = 0;
  for (const char of value) {
    em += (ADVANCES[char] ?? DEFAULT_ADVANCE) / 1000;
  }
  return em * FONT_SIZE;
}

/** Escapes the few characters that would otherwise break the SVG document. */
function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/**
 * Two letters standing in for the business: the first letter of the first two
 * words, so "Dodoma Cleaners" becomes "DC". A single-word name uses its first
 * two letters, and an empty name falls back to a placeholder.
 */
function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/**
 * Builds a `data:` URL holding a small SVG logo with the business initials, used
 * until the business uploads artwork of its own.
 *
 * The initials differ per business, so the image has to be generated at
 * runtime, and encoding it as SVG avoids a native dependency: rasterising a
 * React view would need something like `react-native-view-shot`, while
 * `expo-image` renders SVG on iOS, Android and web. The trade-off is that this
 * value is a self-contained data URL rather than a file hosted on S3 like an
 * uploaded logo.
 */
export function businessInitialsLogo(name: string): string {
  const initials = escapeXml(initialsFor(name));

  // Anchor the left edge so the text straddles the centre by construction,
  // rather than asking the renderer to centre it around the middle.
  const textX = Math.round(CENTRE - textWidth(initials) / 2);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" ` +
    `viewBox="0 0 ${SIZE} ${SIZE}">` +
    `<rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" fill="${palette.light.secondary}"/>` +
    `<text x="${textX}" y="${BASELINE_Y}" text-anchor="start" ` +
    'font-family="Helvetica, Arial, sans-serif" ' +
    `font-size="${FONT_SIZE}" font-weight="700" ` +
    `fill="${palette.light.onSecondary}">${initials}</text>` +
    '</svg>';

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
