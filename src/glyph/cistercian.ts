import {
  createStemGeometry,
  MAX_GLYPH_VALUE_STRING,
  MAX_STEM_COUNT,
  OUTER_X,
  STEM_DIGIT_COUNT,
  STEM_X,
  TOP_Y,
  UPPER_ROW_BOTTOM_Y,
  type QuadrantId,
  type StemGeometry,
} from './glyphGeometry';

type GlyphPoint = {
  x: number;
  y: number;
};

const BASE_DIGIT_PATHS: Record<number, GlyphPoint[][]> = {
  0: [],
  1: [
    [
      { x: STEM_X, y: TOP_Y },
      { x: OUTER_X, y: TOP_Y },
    ],
  ],
  2: [
    [
      { x: STEM_X, y: UPPER_ROW_BOTTOM_Y },
      { x: OUTER_X, y: UPPER_ROW_BOTTOM_Y },
    ],
  ],
  3: [
    [
      { x: STEM_X, y: TOP_Y },
      { x: OUTER_X, y: UPPER_ROW_BOTTOM_Y },
    ],
  ],
  4: [
    [
      { x: STEM_X, y: UPPER_ROW_BOTTOM_Y },
      { x: OUTER_X, y: TOP_Y },
    ],
  ],
  5: [
    [
      { x: STEM_X, y: UPPER_ROW_BOTTOM_Y },
      { x: OUTER_X, y: TOP_Y },
      { x: STEM_X, y: TOP_Y },
    ],
  ],
  6: [
    [
      { x: OUTER_X, y: TOP_Y },
      { x: OUTER_X, y: UPPER_ROW_BOTTOM_Y },
    ],
  ],
  7: [
    [
      { x: STEM_X, y: TOP_Y },
      { x: OUTER_X, y: TOP_Y },
      { x: OUTER_X, y: UPPER_ROW_BOTTOM_Y },
    ],
  ],
  8: [
    [
      { x: STEM_X, y: UPPER_ROW_BOTTOM_Y },
      { x: OUTER_X, y: UPPER_ROW_BOTTOM_Y },
      { x: OUTER_X, y: TOP_Y },
    ],
  ],
  9: [
    [
      { x: STEM_X, y: TOP_Y },
      { x: OUTER_X, y: TOP_Y },
      { x: OUTER_X, y: UPPER_ROW_BOTTOM_Y },
      { x: STEM_X, y: UPPER_ROW_BOTTOM_Y },
    ],
  ],
};

const QUADRANT_TRANSFORMS: Record<QuadrantId, { x: 1 | -1; y: 1 | -1 }> = {
  ones: { x: 1, y: 1 },
  tens: { x: -1, y: 1 },
  hundreds: { x: 1, y: -1 },
  thousands: { x: -1, y: -1 },
};

const STEM_TOLERANCE = 0.001;

const reflect = (value: number, center: number, direction: 1 | -1) =>
  center + (value - center) * direction;

const transformPoint = (
  point: GlyphPoint,
  quadrant: QuadrantId,
  geometry: StemGeometry,
): GlyphPoint => {
  const transform = QUADRANT_TRANSFORMS[quadrant];
  const xOffset = geometry.stemX - STEM_X;
  const translatedX = point.x + xOffset;

  return {
    x: reflect(translatedX, geometry.stemX, transform.x),
    y: reflect(point.y, geometry.quadrantReflectY, transform.y),
  };
};

const isOnStem = (point: GlyphPoint, stemX: number) => Math.abs(point.x - stemX) < STEM_TOLERANCE;

const touchesStem = (points: GlyphPoint[], stemX: number) =>
  points.some((point) => isOnStem(point, stemX));

const toContinuousBranch = (points: GlyphPoint[], stemX: number): GlyphPoint[] => {
  if (points.length < 2) {
    return points;
  }

  let branch = points;
  const first = branch[0]!;

  if (!isOnStem(first, stemX)) {
    branch = [{ x: stemX, y: first.y }, ...branch];
  }

  return [...branch, ...branch.slice(0, -1).reverse()];
};

const pointsToSubpathD = (points: GlyphPoint[]) =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

type PreparedBranches = {
  stemBranches: GlyphPoint[][];
  isolatedBranches: GlyphPoint[][];
};

export type StemDigits = Record<QuadrantId, number>;

export const getStemDigits = (value: number): StemDigits => {
  const normalized = clampStemValue(value);

  return {
    ones: normalized % 10,
    tens: Math.floor(normalized / 10) % 10,
    hundreds: Math.floor(normalized / 100) % 10,
    thousands: Math.floor(normalized / 1000) % 10,
  };
};

const prepareDigitBranches = (value: number, geometry: StemGeometry): PreparedBranches => {
  const digits = getStemDigits(value);

  const stemBranches: GlyphPoint[][] = [];
  const isolatedBranches: GlyphPoint[][] = [];

  (Object.entries(digits) as Array<[QuadrantId, number]>).forEach(([quadrant, digit]) => {
    BASE_DIGIT_PATHS[digit].forEach((points) => {
      const transformed = points.map((point) => transformPoint(point, quadrant, geometry));

      if (touchesStem(transformed, geometry.stemX)) {
        stemBranches.push(toContinuousBranch(transformed, geometry.stemX));
      } else {
        isolatedBranches.push(transformed);
      }
    });
  });

  return { stemBranches, isolatedBranches };
};

const buildUnifiedGlyphPathD = (branches: GlyphPoint[][], geometry: StemGeometry): string => {
  if (branches.length === 0) {
    return `M ${geometry.stemX} ${geometry.topY} L ${geometry.stemX} ${geometry.bottomY}`;
  }

  const anchorYs = new Set<number>([geometry.topY, geometry.bottomY]);
  for (const branch of branches) {
    for (const point of branch) {
      if (isOnStem(point, geometry.stemX)) {
        anchorYs.add(point.y);
      }
    }
  }

  const levels = [...anchorYs].sort((a, b) => a - b);
  const branchesByStartY = new Map<number, GlyphPoint[][]>();

  for (const branch of branches) {
    const startY = branch[0]?.y;
    if (startY === undefined) {
      continue;
    }

    const existing = branchesByStartY.get(startY) ?? [];
    existing.push(branch);
    branchesByStartY.set(startY, existing);
  }

  let current: GlyphPoint = { x: geometry.stemX, y: levels[0]! };
  const parts: string[] = [`M ${current.x} ${current.y}`];

  const appendPoint = (point: GlyphPoint) => {
    if (
      Math.abs(point.x - current.x) < STEM_TOLERANCE &&
      Math.abs(point.y - current.y) < STEM_TOLERANCE
    ) {
      return;
    }

    parts.push(`L ${point.x} ${point.y}`);
    current = point;
  };

  for (let index = 0; index < levels.length; index += 1) {
    const y = levels[index]!;
    const startingHere = branchesByStartY.get(y) ?? [];

    for (const branch of startingHere) {
      for (let pointIndex = 1; pointIndex < branch.length; pointIndex += 1) {
        appendPoint(branch[pointIndex]!);
      }
    }

    const nextY = levels[index + 1];
    if (nextY !== undefined) {
      appendPoint({ x: geometry.stemX, y: nextY });
    }
  }

  return parts.join(' ');
};

export const stripInputDigits = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');

  if (digitsOnly === '') {
    return '';
  }

  return digitsOnly.replace(/^0+(?=\d)/, '');
};

export const normalizeGlyphInput = (value: string | number): string => {
  const stripped = stripInputDigits(String(value));
  return stripped === '' ? '0' : stripped;
};

export const formatDigitsWithCommas = (digits: string): string => {
  if (digits === '') {
    return '';
  }

  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const MAX_INPUT_DIGITS = MAX_GLYPH_VALUE_STRING.length;

/**
 * Digits only, no leading zeros, and never longer than the glyph can show. Anything past
 * the limit is dropped from the end (e.g. with a 4-digit limit, `31415` becomes `3141`), so
 * the value is always the leading digits of what was typed or pasted.
 */
export const clampGlyphInput = (value: string): string =>
  stripInputDigits(value).slice(0, MAX_INPUT_DIGITS);

const clampStemValue = (value: number) =>
  Math.min(10 ** STEM_DIGIT_COUNT - 1, Math.max(0, Math.trunc(value)));

const getStemGroups = (value: string | number): string[] => {
  const normalized = normalizeGlyphInput(value);
  const groups: string[] = [];

  for (let index = normalized.length; index > 0; index -= STEM_DIGIT_COUNT) {
    const start = Math.max(0, index - STEM_DIGIT_COUNT);
    groups.unshift(normalized.slice(start, index));
  }

  return groups.slice(-MAX_STEM_COUNT);
};

export const getStemCount = (value: string | number): number => getStemGroups(value).length;

export type GlyphStem = {
  /** The digits this stem encodes, as typed (e.g. `"12"` or `"0045"`). */
  group: string;
  value: number;
  digits: StemDigits;
  /** The whole stem as one continuous path (used for normal rendering and export). */
  pathD: string;
  /** Just the vertical staff. */
  staffPathD: string;
  /** Each quadrant's marks on their own (empty for a zero digit), for highlighting. */
  quadrantPathD: Record<QuadrantId, string>;
};

const QUADRANTS = Object.keys(QUADRANT_TRANSFORMS) as QuadrantId[];

const getQuadrantPathD = (digit: number, quadrant: QuadrantId, geometry: StemGeometry) =>
  BASE_DIGIT_PATHS[digit]!.map((points) =>
    pointsToSubpathD(points.map((point) => transformPoint(point, quadrant, geometry))),
  ).join(' ');

/**
 * Splits a number into 4-digit groups from the right and builds one stem per group,
 * ordered left to right. Every group is drawn at its true value, so a short leftmost
 * group like `12` in `12,3456` renders as 12 (not 1200) and each number has a unique glyph.
 */
export const getGlyphStems = (value: string | number): GlyphStem[] => {
  const groups = getStemGroups(value);

  return groups.map((group, indexFromLeft) => {
    const geometry = createStemGeometry(groups.length - 1 - indexFromLeft);
    const stemValue = Number.parseInt(group, 10);
    const { stemBranches, isolatedBranches } = prepareDigitBranches(stemValue, geometry);
    const mainPath = buildUnifiedGlyphPathD(stemBranches, geometry);
    const isolatedPaths = isolatedBranches.map((branch) => pointsToSubpathD(branch)).join(' ');
    const digits = getStemDigits(stemValue);

    return {
      group,
      value: stemValue,
      digits,
      pathD: isolatedPaths ? `${mainPath} ${isolatedPaths}` : mainPath,
      staffPathD: `M ${geometry.stemX} ${geometry.topY} L ${geometry.stemX} ${geometry.bottomY}`,
      quadrantPathD: Object.fromEntries(
        QUADRANTS.map((quadrant) => [
          quadrant,
          getQuadrantPathD(digits[quadrant], quadrant, geometry),
        ]),
      ) as Record<QuadrantId, string>,
    };
  });
};

export const getUnifiedGlyphPathD = (value: string | number): string =>
  getGlyphStems(value)
    .map((stem) => stem.pathD)
    .join(' ');
