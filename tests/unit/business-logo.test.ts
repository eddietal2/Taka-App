import { describe, expect, it } from '@jest/globals';

import { businessInitialsLogo } from '@/features/signup/business-logo';

/** The SVG is URL-encoded, so assertions read it back in plain text. */
function svgOf(url: string): string {
  return decodeURIComponent(url);
}

describe('businessInitialsLogo', () => {
  it('returns a self-contained SVG data URL', () => {
    const url = businessInitialsLogo('Dodoma Cleaners');

    expect(url.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(svgOf(url)).toContain('<svg');
  });

  it('takes the first letter of the first two words', () => {
    expect(svgOf(businessInitialsLogo('Dodoma Cleaners'))).toContain('>DC<');
  });

  it('uses the first two letters of a single word', () => {
    expect(svgOf(businessInitialsLogo('Zanaki'))).toContain('>ZA<');
  });

  it('ignores extra whitespace and empty words', () => {
    expect(svgOf(businessInitialsLogo('  Dodoma   Cleaners  '))).toContain('>DC<');
  });

  it('falls back to a placeholder for an empty name', () => {
    expect(svgOf(businessInitialsLogo(''))).toContain('>?<');
    expect(svgOf(businessInitialsLogo('   '))).toContain('>?<');
  });

  it('escapes characters that would otherwise break the document', () => {
    // A name whose initial is "<" must not open a tag inside the SVG.
    const url = businessInitialsLogo('<script> alert');

    expect(svgOf(url)).toContain('&#60;A');
    expect(svgOf(url)).not.toContain('<script>');
  });

  it('paints the mark in the brand colours', () => {
    expect(svgOf(businessInitialsLogo('Dodoma Cleaners'))).toContain('fill="#42596B"');
  });
});
