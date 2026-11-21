import { describe, expect, it } from 'vitest';
import {
  formatDigitsWithCommas,
  getGlyphStems,
  getStemDigits,
  getUnifiedGlyphPathD,
  clampGlyphInput,
  normalizeGlyphInput,
  stripInputDigits,
} from './cistercian';
import { MAX_GLYPH_VALUE_STRING, STEM_STRIDE } from './glyphGeometry';

describe('input helpers', () => {
  it('strips non-digits and leading zeros', () => {
    expect(stripInputDigits('1,234')).toBe('1234');
    expect(stripInputDigits('00042')).toBe('42');
    expect(stripInputDigits('000')).toBe('0');
    expect(stripInputDigits('abc')).toBe('');
  });

  it('normalizes empty input to zero', () => {
    expect(normalizeGlyphInput('')).toBe('0');
    expect(normalizeGlyphInput(907)).toBe('907');
  });

  it('formats digits with thousands separators', () => {
    expect(formatDigitsWithCommas('')).toBe('');
    expect(formatDigitsWithCommas('999')).toBe('999');
    expect(formatDigitsWithCommas('1234567')).toBe('1,234,567');
  });

  it('keeps up to 12 digits as they are', () => {
    expect(clampGlyphInput(MAX_GLYPH_VALUE_STRING)).toBe(MAX_GLYPH_VALUE_STRING);
    expect(clampGlyphInput('2,026')).toBe('2026');
    expect(clampGlyphInput('')).toBe('');
  });

  it('drops digits past 12 from the end', () => {
    // 13 digits: the trailing 5 goes, like 31415 -> 3141 with a 4-digit limit.
    const typed = `${'3141'.repeat(3)}5`;
    expect(clampGlyphInput(typed)).toBe('3141'.repeat(3));
    expect(clampGlyphInput(`1${'0'.repeat(30)}`)).toBe(`1${'0'.repeat(11)}`);
  });

  it('ignores leading zeros when counting the limit', () => {
    expect(clampGlyphInput(`000${MAX_GLYPH_VALUE_STRING}`)).toBe(MAX_GLYPH_VALUE_STRING);
  });
});

describe('getStemDigits', () => {
  it('maps a value to its four place digits', () => {
    expect(getStemDigits(1234)).toEqual({ thousands: 1, hundreds: 2, tens: 3, ones: 4 });
    expect(getStemDigits(7)).toEqual({ thousands: 0, hundreds: 0, tens: 0, ones: 7 });
  });
});

describe('getGlyphStems', () => {
  it('draws zero as a bare stem', () => {
    expect(getUnifiedGlyphPathD('0')).toBe('M 30 0 L 30 90');
  });

  it('draws known single-stem glyphs', () => {
    // 2: tens -> horizontal at the upper-row bottom; 6: ones -> vertical on the outer edge.
    expect(getUnifiedGlyphPathD('2026')).toBe(
      'M 30 0 L 30 30 L 0 30 L 30 30 L 30 60 L 0 60 L 30 60 L 30 90 M 60 0 L 60 30',
    );
    expect(getUnifiedGlyphPathD('4723')).toBe(
      'M 30 0 L 60 30 L 30 0 L 30 30 L 0 30 L 30 30 L 30 60 L 0 90 L 30 60 L 30 90 L 60 90 L 60 60 L 60 90 L 30 90',
    );
  });

  it('splits into 4-digit groups from the right', () => {
    const stems = getGlyphStems('1234567');
    expect(stems.map((stem) => stem.group)).toEqual(['123', '4567']);
    expect(stems.map((stem) => stem.value)).toEqual([123, 4567]);
  });

  it('draws a short leftmost group at its true value', () => {
    const [left, right] = getGlyphStems('12345');
    expect(left?.value).toBe(1);
    expect(left?.digits).toEqual({ thousands: 0, hundreds: 0, tens: 0, ones: 1 });
    expect(right?.value).toBe(2345);
  });

  it('gives every number a distinct glyph', () => {
    // These used to collide when short groups were scaled up (12 → 1200).
    expect(getUnifiedGlyphPathD('122345')).not.toBe(getUnifiedGlyphPathD('12002345'));
    expect(getUnifiedGlyphPathD('10000')).not.toBe(getUnifiedGlyphPathD('10000000'));

    const paths = new Set<string>();
    for (let value = 0; value <= 9999; value += 1) {
      paths.add(getUnifiedGlyphPathD(value));
    }
    expect(paths.size).toBe(10000);
  });

  it('shifts each additional stem left by one stride', () => {
    const [left, right] = getGlyphStems('10001');
    const shifted = right?.pathD.replace(
      /(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g,
      (_, x, y) => `${Number(x) - STEM_STRIDE} ${y}`,
    );
    expect(left?.pathD).toBe(shifted);
  });

  it('exposes each quadrant and the staff separately for highlighting', () => {
    const [stem] = getGlyphStems('2026');
    expect(stem?.staffPathD).toBe('M 30 0 L 30 90');
    expect(stem?.quadrantPathD.ones).toBe('M 60 0 L 60 30'); // 6
    expect(stem?.quadrantPathD.tens).toBe('M 30 30 L 0 30'); // 2, mirrored left
    expect(stem?.quadrantPathD.hundreds).toBe(''); // 0 draws nothing
    expect(stem?.quadrantPathD.thousands).toBe('M 30 60 L 0 60'); // 2, mirrored left + down
  });

  it('places quadrant paths on their own stem', () => {
    const [left] = getGlyphStems('10000');
    expect(left?.quadrantPathD.ones).toBe(`M ${30 - STEM_STRIDE} 0 L ${60 - STEM_STRIDE} 0`);
  });

  it('caps at three stems', () => {
    expect(MAX_GLYPH_VALUE_STRING).toHaveLength(12);
    expect(getGlyphStems(MAX_GLYPH_VALUE_STRING)).toHaveLength(3);
  });
});
