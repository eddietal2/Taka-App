import { describe, expect, it } from '@jest/globals';

import {
    LANGUAGE_LABELS,
    LANGUAGES,
    TRANSLATIONS,
    type TranslationKey,
} from '@/features/i18n/translations';

const KEYS = Object.keys(TRANSLATIONS.en) as TranslationKey[];
const PLACEHOLDER = /\{(\w+)\}/g;

function placeholdersIn(value: string): string[] {
  return [...value.matchAll(PLACEHOLDER)].map((match) => match[1]).sort();
}

describe('translation catalogue', () => {
  it('labels every language it ships', () => {
    for (const language of LANGUAGES) {
      expect(LANGUAGE_LABELS[language]).toBeTruthy();
    }
  });

  it('translates every key into every language', () => {
    // The catalogue is typed so a missing key is a compile error; this catches a
    // key added to English and silenced with an empty string instead.
    for (const language of LANGUAGES) {
      const catalog = TRANSLATIONS[language];
      expect(Object.keys(catalog).sort()).toEqual([...KEYS].sort());
    }
  });

  it('has no blank strings', () => {
    for (const language of LANGUAGES) {
      for (const key of KEYS) {
        expect(TRANSLATIONS[language][key].trim()).not.toBe('');
      }
    }
  });

  it('uses the same placeholders in every language', () => {
    // A translation that drops or renames a token would render the raw `{phone}`
    // to the user instead of the value.
    for (const key of KEYS) {
      expect(placeholdersIn(TRANSLATIONS.sw[key])).toEqual(placeholdersIn(TRANSLATIONS.en[key]));
    }
  });

  it('covers the role-switching copy added for multi-role accounts', () => {
    const required: TranslationKey[] = [
      'profile.rolesLabel',
      'profile.roleActive',
      'profile.switch',
      'profile.switchToReporter',
      'profile.switchToResident',
      'profile.addReporter',
      'profile.addResident',
      'switchRole.title',
      'switchRole.message',
      'switchRole.failed',
      'switchRole.retry',
      'addRole.submit',
      'addRole.reviewTitle',
      'addRole.reviewSubtitle',
    ];

    for (const key of required) {
      expect(TRANSLATIONS.en[key]).toBeTruthy();
      expect(TRANSLATIONS.sw[key]).toBeTruthy();
    }
  });
});
