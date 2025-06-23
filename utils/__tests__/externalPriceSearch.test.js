import { getFallbackPricePerSqm } from '../externalPriceSearch.js';

describe('getFallbackPricePerSqm', () => {
  test('known city and neighborhood returns specific price', () => {
    expect(getFallbackPricePerSqm('תל אביב', 'נוה צדק')).toBe(47000);
  });

  test('unknown city falls back to 25000', () => {
    expect(getFallbackPricePerSqm('Unknown City')).toBe(25000);
  });
});

