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

export type GlyphLine = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type GlyphPoint = {
  x: number;
  y: number;
};

export type GlyphPath = {
  id: string;
  points: GlyphPoint[];
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

const reflect = (value: number, center: number, direction: 1 | -1) =>
  center + (value - center) * direction;

const transformPoint = (point: GlyphPoint, quadrant: QuadrantId): GlyphPoint => {
  const transform = QUADRANT_TRANSFORMS[quadrant];

  return {
    x: reflect(point.x, STEM_X, transform.x),
    y: reflect(point.y, QUADRANT_REFLECT_Y, transform.y),
  };
};

export const pointsToPathD = (points: GlyphPoint[]) =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

export const clampGlyphNumber = (value: number) => Math.min(9999, Math.max(0, Math.trunc(value)));

export const getGlyphPaths = (value: number): GlyphPath[] => {
  const normalized = clampGlyphNumber(value);
  const digits = {
    ones: normalized % 10,
    tens: Math.floor(normalized / 10) % 10,
    hundreds: Math.floor(normalized / 100) % 10,
    thousands: Math.floor(normalized / 1000) % 10,
  } satisfies Record<QuadrantId, number>;

  const paths: GlyphPath[] = [
    {
      id: 'staff',
      points: [
        { x: STEM_X, y: TOP_Y },
        { x: STEM_X, y: BOTTOM_Y },
      ],
    },
  ];

  (Object.entries(digits) as Array<[QuadrantId, number]>).forEach(([quadrant, digit]) => {
    BASE_DIGIT_PATHS[digit].forEach((points, pathIndex) => {
      paths.push({
        id: `${quadrant}-${digit}-${pathIndex}`,
        points: points.map((point) => transformPoint(point, quadrant)),
      });
    });
  });

  return paths;
};
