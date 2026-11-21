import { type GlyphStem } from '../glyph/cistercian';
import { type QuadrantId } from '../glyph/glyphGeometry';
import { type GlyphHighlight, matchesCell } from '../glyph/highlight';

const PLACES: Array<{ quadrant: QuadrantId; label: string }> = [
  { quadrant: 'thousands', label: 'thousands' },
  { quadrant: 'hundreds', label: 'hundreds' },
  { quadrant: 'tens', label: 'tens' },
  { quadrant: 'ones', label: 'ones' },
];

type GlyphBreakdownProps = {
  stems: GlyphStem[];
  highlight: GlyphHighlight | null;
  onHighlightChange: (highlight: GlyphHighlight | null) => void;
};

/**
 * One row per stem (left to right), one fixed column per place value, so typing only
 * changes digits and never reflows the layout. Hovering a digit highlights that exact
 * mark in the glyph; hovering a column header highlights that place in every stem.
 */
export const GlyphBreakdown = ({ stems, highlight, onHighlightChange }: GlyphBreakdownProps) => (
  <div
    role="table"
    aria-label="Digit breakdown"
    className="grid grid-cols-[repeat(4,4rem)] gap-1 text-center sm:grid-cols-[repeat(4,4.75rem)]"
    onPointerLeave={() => onHighlightChange(null)}
  >
    <div role="row" className="contents">
      {PLACES.map(({ quadrant, label }) => {
        const isActive = highlight?.quadrant === quadrant;

        return (
          <div
            key={quadrant}
            role="columnheader"
            onPointerEnter={() => onHighlightChange({ stem: null, quadrant })}
            className={`cursor-default pb-1 text-xs transition-colors duration-200 select-none ${
              isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            {label}
          </div>
        );
      })}
    </div>

    {stems.map((stem, stemIndex) => (
      <div key={stemIndex} role="row" className="contents">
        {PLACES.map(({ quadrant }) => {
          const digit = stem.digits[quadrant];
          const isActive = matchesCell(highlight, stemIndex, quadrant);

          return (
            <div
              key={quadrant}
              role="cell"
              onPointerEnter={() => onHighlightChange({ stem: stemIndex, quadrant })}
              className={`cursor-default rounded-md py-1 text-base font-medium tabular-nums transition-colors duration-200 select-none ${
                isActive ? 'bg-zinc-100 dark:bg-zinc-900' : ''
              } ${digit === 0 ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-900 dark:text-zinc-100'}`}
            >
              {digit}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);
