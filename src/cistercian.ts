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

type Quadrant = 'ones' | 'tens' | 'hundreds' | 'thousands';

const CENTER_X = 50;
const CENTER_Y = 50;
const TOP_Y = 5;
const UPPER_SEGMENT_END_Y = 35;
const BOTTOM_Y = 95;
const OUTER_X = 80;

const BASE_DIGIT_PATHS: Record<number, GlyphPoint[][]> = {
  0: [],
  1: [
    [
      { x: CENTER_X, y: TOP_Y },
      { x: OUTER_X, y: TOP_Y },
    ],
  ],
  2: [
    [
      { x: CENTER_X, y: UPPER_SEGMENT_END_Y },
      { x: OUTER_X, y: UPPER_SEGMENT_END_Y },
    ],
  ],
  3: [
    [
      { x: CENTER_X, y: TOP_Y },
      { x: OUTER_X, y: UPPER_SEGMENT_END_Y },
    ],
  ],
  4: [
    [
      { x: CENTER_X, y: UPPER_SEGMENT_END_Y },
      { x: OUTER_X, y: TOP_Y },
    ],
  ],
  5: [
    [
      { x: CENTER_X, y: UPPER_SEGMENT_END_Y },
      { x: OUTER_X, y: TOP_Y },
      { x: CENTER_X, y: TOP_Y },
    ],
  ],
  6: [
    [
      { x: OUTER_X, y: TOP_Y },
      { x: OUTER_X, y: UPPER_SEGMENT_END_Y },
    ],
  ],
  7: [
    [
      { x: CENTER_X, y: TOP_Y },
      { x: OUTER_X, y: TOP_Y },
      { x: OUTER_X, y: UPPER_SEGMENT_END_Y },
    ],
  ],
  8: [
    [
      { x: CENTER_X, y: UPPER_SEGMENT_END_Y },
      { x: OUTER_X, y: UPPER_SEGMENT_END_Y },
      { x: OUTER_X, y: TOP_Y },
    ],
  ],
  9: [
    [
      { x: CENTER_X, y: TOP_Y },
      { x: OUTER_X, y: TOP_Y },
      { x: OUTER_X, y: UPPER_SEGMENT_END_Y },
      { x: CENTER_X, y: UPPER_SEGMENT_END_Y },
    ],
  ],
};

const QUADRANT_TRANSFORMS: Record<Quadrant, { x: 1 | -1; y: 1 | -1 }> = {
  ones: { x: 1, y: 1 },
  tens: { x: -1, y: 1 },
  hundreds: { x: 1, y: -1 },
  thousands: { x: -1, y: -1 },
};

const reflect = (value: number, center: number, direction: 1 | -1) =>
  center + (value - center) * direction;

const transformPoint = (point: GlyphPoint, quadrant: Quadrant): GlyphPoint => {
  const transform = QUADRANT_TRANSFORMS[quadrant];

  return {
    x: reflect(point.x, CENTER_X, transform.x),
    y: reflect(point.y, CENTER_Y, transform.y),
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
  } satisfies Record<Quadrant, number>;

  const paths: GlyphPath[] = [
    {
      id: 'staff',
      points: [
        { x: CENTER_X, y: TOP_Y },
        { x: CENTER_X, y: BOTTOM_Y },
      ],
    },
  ];

  (Object.entries(digits) as Array<[Quadrant, number]>).forEach(([quadrant, digit]) => {
    BASE_DIGIT_PATHS[digit].forEach((points, pathIndex) => {
      paths.push({
        id: `${quadrant}-${digit}-${pathIndex}`,
        points: points.map((point) => transformPoint(point, quadrant)),
      });
    });
  });

  return paths;
};
