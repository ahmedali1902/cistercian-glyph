import { type Ref } from 'react';
import { formatDigitsWithCommas, type GlyphStem } from '../glyph/cistercian';
import { GLYPH_STROKE_WIDTH } from '../glyph/glyphGeometry';
import { type GlyphHighlight, matchesStem } from '../glyph/highlight';

/** Stems not being pointed at. */
const OTHER_STEM_OPACITY = 0.12;
/** The rest of the pointed-at stem while one quadrant is focused. */
const SAME_STEM_OPACITY = 0.3;
const FADE = 'transition-opacity duration-200';

type CistercianGlyphProps = {
  ref?: Ref<SVGSVGElement>;
  displayValue: string;
  stems: GlyphStem[];
  viewBox: string;
  /** What the digit breakdown is pointing at, or null for nothing. */
  highlight: GlyphHighlight | null;
};

export const CistercianGlyph = ({
  ref,
  displayValue,
  stems,
  viewBox,
  highlight,
}: CistercianGlyphProps) => {
  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      role="img"
      aria-label={`Cistercian numeral for ${formatDigitsWithCommas(displayValue)}`}
      className="block h-full w-full overflow-visible text-zinc-950 dark:text-zinc-50"
      fill="none"
      stroke="currentColor"
      strokeWidth={GLYPH_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {stems.map((stem, index) => {
        const inStem = highlight !== null && matchesStem(highlight, index);
        const quadrant = highlight?.quadrant ?? null;
        const showFocus = inStem && quadrant !== null;
        const baseOpacity =
          highlight === null
            ? 1
            : !inStem
              ? OTHER_STEM_OPACITY
              : quadrant !== null
                ? SAME_STEM_OPACITY
                : 1;

        return (
          <g key={index}>
            <path d={stem.pathD} opacity={baseOpacity} className={FADE} />
            {/* The focused quadrant (plus its staff) drawn on top at full strength.
                Marked data-highlight so exports leave it out. */}
            <path
              data-highlight
              d={showFocus ? `${stem.staffPathD} ${stem.quadrantPathD[quadrant]}` : stem.staffPathD}
              opacity={showFocus ? 1 : 0}
              className={FADE}
            />
          </g>
        );
      })}
    </svg>
  );
};
