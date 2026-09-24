import { describe, expect, it } from '@jest/globals';

import {
    INTENT_COPY,
    USER_INTENTS,
    WASTE_TIER_LABEL_KEYS,
    WASTE_TIERS,
} from '@/constants/registration';

describe('account types', () => {
  it('offers exactly the three the API stores', () => {
    expect(USER_INTENTS).toEqual(['RESIDENT', 'REPORTER', 'COMMERCIAL']);
  });

  it('has presentation copy for every account type', () => {
    for (const intent of USER_INTENTS) {
      expect(INTENT_COPY[intent].titleKey).toBeTruthy();
      expect(INTENT_COPY[intent].descriptionKey).toBeTruthy();
      expect(INTENT_COPY[intent].imageLabelKey).toBeTruthy();
    }
  });

  it('marks only the types that need a service address', () => {
    // A reporter pins nothing and holds no meter, so the address row and the
    // location screens stay hidden for that account type.
    expect(INTENT_COPY.RESIDENT.needsLocation).toBe(true);
    expect(INTENT_COPY.COMMERCIAL.needsLocation).toBe(true);
    expect(INTENT_COPY.REPORTER.needsLocation).toBe(false);
  });

  it('names a business image differently from a personal one', () => {
    expect(INTENT_COPY.COMMERCIAL.imageLabelKey).toBe('intent.commercial.imageLabel');
    expect(INTENT_COPY.RESIDENT.imageLabelKey).toBe('intent.resident.imageLabel');
    expect(INTENT_COPY.REPORTER.imageLabelKey).toBe('intent.reporter.imageLabel');
  });
});

describe('waste tiers', () => {
  it('has a label for every tier the API accepts', () => {
    for (const tier of WASTE_TIERS) {
      expect(WASTE_TIER_LABEL_KEYS[tier]).toBeTruthy();
    }
  });

  it('labels exactly the tiers it lists, with no extras', () => {
    expect(Object.keys(WASTE_TIER_LABEL_KEYS).sort()).toEqual([...WASTE_TIERS].sort());
  });
});
