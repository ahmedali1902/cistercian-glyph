/**
 * Coordinate grid for Cistercian glyphs.
 *
 * The SVG viewBox is a 1:1 square; the glyph body (2:3) is centered inside it.
 * @see docs/glyph-system.md
 */

/** Square SVG viewBox side length (`viewBox="0 0 100 100"`). */
export const VIEWBOX_SIZE = 100;

export const GRID_COLUMNS = 2;
export const GRID_ROWS = 3;

/** Side length of each square grid cell in viewBox units. */
export const CELL_SIZE = 30;

export const GLYPH_WIDTH = GRID_COLUMNS * CELL_SIZE;
export const GLYPH_HEIGHT = GRID_ROWS * CELL_SIZE;

/** Top-left corner of the 2:3 glyph frame inside the square viewBox. */
export const GLYPH_LEFT = (VIEWBOX_SIZE - GLYPH_WIDTH) / 2;
export const GLYPH_TOP = (VIEWBOX_SIZE - GLYPH_HEIGHT) / 2;

/** Vertical stem on the column seam between left and right cells. */
export const STEM_X = GLYPH_LEFT + CELL_SIZE;

/** Outer edge of the right column (ones / hundreds template side). */
export const OUTER_X = GLYPH_LEFT + GLYPH_WIDTH;

export const TOP_Y = GLYPH_TOP;
export const UPPER_ROW_BOTTOM_Y = GLYPH_TOP + CELL_SIZE;
export const LOWER_ROW_TOP_Y = GLYPH_TOP + 2 * CELL_SIZE;
export const BOTTOM_Y = GLYPH_TOP + GLYPH_HEIGHT;

/** Y axis used when mirroring digit paths between upper and lower quadrants. */
export const QUADRANT_REFLECT_Y = GLYPH_TOP + 1.5 * CELL_SIZE;

export type QuadrantId = 'ones' | 'tens' | 'hundreds' | 'thousands';

export const QUADRANT_BOUNDS: Record<
  QuadrantId,
  { xMin: number; xMax: number; yMin: number; yMax: number }
> = {
  tens: {
    xMin: GLYPH_LEFT,
    xMax: STEM_X,
    yMin: TOP_Y,
    yMax: UPPER_ROW_BOTTOM_Y,
  },
  ones: {
    xMin: STEM_X,
    xMax: OUTER_X,
    yMin: TOP_Y,
    yMax: UPPER_ROW_BOTTOM_Y,
  },
  thousands: {
    xMin: GLYPH_LEFT,
    xMax: STEM_X,
    yMin: LOWER_ROW_TOP_Y,
    yMax: BOTTOM_Y,
  },
  hundreds: {
    xMin: STEM_X,
    xMax: OUTER_X,
    yMin: LOWER_ROW_TOP_Y,
    yMax: BOTTOM_Y,
  },
};

export const SVG_VIEWBOX = `0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}` as const;
