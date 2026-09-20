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
 * vertical centre would hang the letters well above the middle. Deriving the
 * offset from the font size keeps this working on any renderer, whereas a
 * `dy="0.35em"` correction depends on `em` units being honoured.
 */
const CAP_HEIGHT_RATIO = 0.7;

const CENTRE = SIZE / 2;
const BASELINE_Y = Math.round(CENTRE + (FONT_SIZE * CAP_HEIGHT_RATIO) / 2);

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

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" ` +
    `viewBox="0 0 ${SIZE} ${SIZE}">` +
    `<rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" fill="${palette.light.secondary}"/>` +
    `<text x="${CENTRE}" y="${BASELINE_Y}" text-anchor="middle" ` +
    'font-family="Helvetica, Arial, sans-serif" ' +
    `font-size="${FONT_SIZE}" font-weight="700" ` +
    `fill="${palette.light.onSecondary}">${initials}</text>` +
    '</svg>';

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
