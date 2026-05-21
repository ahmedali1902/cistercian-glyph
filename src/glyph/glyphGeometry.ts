export const SVG_SIZE = 320;

/** Change MAX_STEM_COUNT to scale range, layout, and viewBox. */
export const MAX_STEM_COUNT = 6;
export const STEM_DIGIT_COUNT = 4 as const;

const MAX_DIGIT_COUNT = MAX_STEM_COUNT * STEM_DIGIT_COUNT;
export const MAX_GLYPH_VALUE_STRING = '9'.repeat(MAX_DIGIT_COUNT);

export const GLYPH_STROKE_WIDTH = 4;
export const VIEWBOX_INSET = GLYPH_STROKE_WIDTH / 2 + 1;
export const GLYPH_FRAME_PADDING = 18;
export const STEM_GAP = 18;

export const GRID_COLUMNS = 2;
export const GRID_ROWS = 3;

export const CELL_SIZE = 30;

export const GLYPH_WIDTH = GRID_COLUMNS * CELL_SIZE;
export const GLYPH_HEIGHT = GRID_ROWS * CELL_SIZE;
export const STEM_STRIDE = GLYPH_WIDTH + STEM_GAP;

export const GLYPH_LEFT = 0;
export const GLYPH_TOP = 0;

export const STEM_X = GLYPH_LEFT + CELL_SIZE;
export const OUTER_X = GLYPH_LEFT + GLYPH_WIDTH;

export const TOP_Y = GLYPH_TOP;
export const UPPER_ROW_BOTTOM_Y = GLYPH_TOP + CELL_SIZE;
export const LOWER_ROW_TOP_Y = GLYPH_TOP + 2 * CELL_SIZE;
export const BOTTOM_Y = GLYPH_TOP + GLYPH_HEIGHT;

export const QUADRANT_REFLECT_Y = GLYPH_TOP + 1.5 * CELL_SIZE;

export const GLYPH_CENTER_X = GLYPH_LEFT + GLYPH_WIDTH / 2;
export const GLYPH_CENTER_Y = GLYPH_TOP + GLYPH_HEIGHT / 2;

export type QuadrantId = 'ones' | 'tens' | 'hundreds' | 'thousands';

const normalizeStemCount = (stemCount: number) => Math.min(Math.max(stemCount, 1), MAX_STEM_COUNT);

type GlyphViewBoxBounds = {
  minX: number;
  minY: number;
  width: number;
  height: number;
};

const getGlyphContentWidth = (stemCount: number) => {
  const count = normalizeStemCount(stemCount);
  return GLYPH_WIDTH + (count - 1) * STEM_STRIDE;
};

const getGlyphViewBoxBounds = (stemCount: number): GlyphViewBoxBounds => {
  const count = normalizeStemCount(stemCount);
  const contentMinX = -(count - 1) * STEM_STRIDE;
  const contentWidth = getGlyphContentWidth(count);

  return {
    minX: contentMinX - VIEWBOX_INSET,
    minY: -VIEWBOX_INSET,
    width: contentWidth + 2 * VIEWBOX_INSET,
    height: GLYPH_HEIGHT + 2 * VIEWBOX_INSET,
  };
};

export const getGlyphViewBox = (stemCount: number): string => {
  const { minX, minY, width, height } = getGlyphViewBoxBounds(stemCount);
  return `${minX} ${minY} ${width} ${height}`;
};

export const getGlyphContentAspectRatio = (stemCount: number): number => {
  const { width, height } = getGlyphViewBoxBounds(stemCount);
  return width / height;
};

export const SVG_VIEWBOX = getGlyphViewBox(1);

export type StemGeometry = {
  glyphLeft: number;
  stemX: number;
  outerX: number;
  topY: number;
  upperRowBottomY: number;
  lowerRowTopY: number;
  bottomY: number;
  quadrantReflectY: number;
};

export const createStemGeometry = (stemIndexFromRight: number): StemGeometry => {
  const xOffset = -stemIndexFromRight * STEM_STRIDE;

  return {
    glyphLeft: GLYPH_LEFT + xOffset,
    stemX: STEM_X + xOffset,
    outerX: OUTER_X + xOffset,
    topY: TOP_Y,
    upperRowBottomY: UPPER_ROW_BOTTOM_Y,
    lowerRowTopY: LOWER_ROW_TOP_Y,
    bottomY: BOTTOM_Y,
    quadrantReflectY: QUADRANT_REFLECT_Y,
  };
};
