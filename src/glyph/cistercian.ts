/**
 * Cistercian numeral geometry and path generation.
 *
 * @see docs/glyph-system.md
 * @see glyphGeometry.ts
 */
import {
  BOTTOM_Y,
  OUTER_X,
  QUADRANT_REFLECT_Y,
  STEM_X,
  TOP_Y,
  UPPER_ROW_BOTTOM_Y,
  type QuadrantId,
} from './glyphGeometry';

export type GlyphPoint = {
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

const transformPoint = (point: GlyphPoint, quadrant: QuadrantId): GlyphPoint => {
  const transform = QUADRANT_TRANSFORMS[quadrant];

  return {
    x: reflect(point.x, STEM_X, transform.x),
    y: reflect(point.y, QUADRANT_REFLECT_Y, transform.y),
  };
};

const isOnStem = (point: GlyphPoint) => Math.abs(point.x - STEM_X) < STEM_TOLERANCE;

const touchesStem = (points: GlyphPoint[]) => points.some(isOnStem);

/** Doubles back along the same segment so a continuous stroke does not add extra geometry. */
const toContinuousBranch = (points: GlyphPoint[]): GlyphPoint[] => {
  if (points.length < 2) {
    return points;
  }

  let branch = points;
  const first = branch[0]!;

  if (!isOnStem(first)) {
    branch = [{ x: STEM_X, y: first.y }, ...branch];
  }

  return [...branch, ...branch.slice(0, -1).reverse()];
};

const pointsToSubpathD = (points: GlyphPoint[]) =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

type PreparedBranches = {
  stemBranches: GlyphPoint[][];
  isolatedBranches: GlyphPoint[][];
};

const prepareDigitBranches = (value: number): PreparedBranches => {
  const normalized = clampGlyphNumber(value);
  const digits = {
    ones: normalized % 10,
    tens: Math.floor(normalized / 10) % 10,
    hundreds: Math.floor(normalized / 100) % 10,
    thousands: Math.floor(normalized / 1000) % 10,
  } satisfies Record<QuadrantId, number>;

  const stemBranches: GlyphPoint[][] = [];
  const isolatedBranches: GlyphPoint[][] = [];

  (Object.entries(digits) as Array<[QuadrantId, number]>).forEach(([quadrant, digit]) => {
    BASE_DIGIT_PATHS[digit].forEach((points) => {
      const transformed = points.map((point) => transformPoint(point, quadrant));

      if (touchesStem(transformed)) {
        stemBranches.push(toContinuousBranch(transformed));
      } else {
        isolatedBranches.push(transformed);
      }
    });
  });

  return { stemBranches, isolatedBranches };
};

/** Walks the stave top-to-bottom, detouring along each digit branch and returning. */
export const buildUnifiedGlyphPathD = (branches: GlyphPoint[][]): string => {
  if (branches.length === 0) {
    return `M ${STEM_X} ${TOP_Y} L ${STEM_X} ${BOTTOM_Y}`;
  }

  const anchorYs = new Set<number>([TOP_Y, BOTTOM_Y]);
  for (const branch of branches) {
    for (const point of branch) {
      if (isOnStem(point)) {
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

  let current: GlyphPoint = { x: STEM_X, y: levels[0]! };
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
      appendPoint({ x: STEM_X, y: nextY });
    }
  }

  return parts.join(' ');
};

export const clampGlyphNumber = (value: number) => Math.min(9999, Math.max(0, Math.trunc(value)));

export const getUnifiedGlyphPathD = (value: number): string => {
  const { stemBranches, isolatedBranches } = prepareDigitBranches(value);
  const mainPath = buildUnifiedGlyphPathD(stemBranches);
  const isolatedPaths = isolatedBranches.map((branch) => pointsToSubpathD(branch)).join(' ');

  return isolatedPaths ? `${mainPath} ${isolatedPaths}` : mainPath;
};
