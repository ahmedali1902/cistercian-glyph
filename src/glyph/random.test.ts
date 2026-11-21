import { describe, expect, it } from 'vitest';
import { clampGlyphInput, getStemCount } from './cistercian';
import { RANDOM_MAX_STEMS, randomGlyphNumber } from './random';

describe('randomGlyphNumber', () => {
  const samples = Array.from({ length: 12_000 }, () => randomGlyphNumber());

  it('returns valid, non-zero numbers without leading zeros', () => {
    for (const value of samples) {
      expect(value).toMatch(/^[1-9]\d*$/);
      expect(clampGlyphInput(value)).toBe(value);
    }
  });

  it('never goes past 3 stems', () => {
    expect(RANDOM_MAX_STEMS).toBe(3);
    for (const value of samples) {
      expect(getStemCount(value)).toBeLessThanOrEqual(RANDOM_MAX_STEMS);
    }
  });

  it('makes every stem count equally likely', () => {
    const counts = new Array<number>(RANDOM_MAX_STEMS + 1).fill(0);
    for (const value of samples) {
      counts[getStemCount(value)]! += 1;
    }

    const expected = samples.length / RANDOM_MAX_STEMS; // 4,000 each
    for (let stems = 1; stems <= RANDOM_MAX_STEMS; stems += 1) {
      // ±15% is more than 10 standard deviations, so this won't flake.
      expect(counts[stems]).toBeGreaterThan(expected * 0.85);
      expect(counts[stems]).toBeLessThan(expected * 1.15);
    }
  });

  it('is uniform within a stem count (not biased toward small values)', () => {
    const singleStem = samples.filter((value) => value.length <= 4).map(Number);
    const fourDigit = singleStem.filter((value) => value >= 1000).length;
    // 9,000 of the 9,999 single-stem values have four digits (90%).
    expect(fourDigit / singleStem.length).toBeGreaterThan(0.85);
  });

  it('never repeats the current number', () => {
    for (let index = 0; index < 1000; index += 1) {
      const current = randomGlyphNumber();
      expect(randomGlyphNumber(current)).not.toBe(current);
    }
  });
});
