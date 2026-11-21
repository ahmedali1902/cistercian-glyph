import { MAX_STEM_COUNT, STEM_DIGIT_COUNT } from './glyphGeometry';

const GROUP_SIZE = 10 ** STEM_DIGIT_COUNT; // 10,000 values per stem

/** Random picks can use every stem count the glyph supports. */
export const RANDOM_MAX_STEMS = MAX_STEM_COUNT;

/** Uniform integer in [0, n) from the crypto RNG, using rejection sampling to avoid modulo bias. */
const randomBelow = (n: number): number => {
  const limit = Math.floor(2 ** 32 / n) * n;
  const buffer = new Uint32Array(1);

  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0]! >= limit);

  return buffer[0]! % n;
};

/**
 * A random number whose stem count (1–RANDOM_MAX_STEMS) is equally likely, and which is
 * uniform among all numbers with that many stems. Zero is excluded (it's a bare stem).
 *
 * Uniform within a stem count k means: the leftmost group is 1–9999 (so the number really
 * has k stems) and each of the other k − 1 groups is 0000–9999.
 */
export const randomGlyphNumber = (current = ''): string => {
  let value: string;

  do {
    const stemCount = 1 + randomBelow(RANDOM_MAX_STEMS);
    value = String(1 + randomBelow(GROUP_SIZE - 1));

    for (let stem = 1; stem < stemCount; stem += 1) {
      value += String(randomBelow(GROUP_SIZE)).padStart(STEM_DIGIT_COUNT, '0');
    }
  } while (value === current); // always change what's on screen

  return value;
};
