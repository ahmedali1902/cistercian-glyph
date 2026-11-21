import { type QuadrantId } from './glyphGeometry';

/**
 * What the digit breakdown is pointing at. `null` fields mean "any":
 * - `{ stem: 1, quadrant: 'tens' }` — the tens mark of the second stem (a digit cell)
 * - `{ stem: null, quadrant: 'tens' }` — the tens mark of every stem (a column header)
 */
export type GlyphHighlight = {
  stem: number | null;
  quadrant: QuadrantId | null;
};

export const matchesStem = (highlight: GlyphHighlight, stem: number) =>
  highlight.stem === null || highlight.stem === stem;

export const matchesCell = (highlight: GlyphHighlight | null, stem: number, quadrant: QuadrantId) =>
  highlight !== null &&
  matchesStem(highlight, stem) &&
  (highlight.quadrant === null || highlight.quadrant === quadrant);
