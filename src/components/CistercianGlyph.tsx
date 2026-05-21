import { forwardRef } from 'react';
import {
  GLYPH_CENTER_X,
  GLYPH_CENTER_Y,
  GLYPH_STROKE_WIDTH,
  GLYPH_WIDTH,
  SVG_VIEWBOX,
} from '../glyph/glyphGeometry';

type CistercianGlyphProps = {
  isValid: boolean;
  displayValue: string;
  glyphPathD: string;
  viewBox: string;
};

const InvalidGlyph = () => {
  const radius = GLYPH_WIDTH * 0.53;
  const eyeOffsetX = radius * 0.38;
  const eyeY = GLYPH_CENTER_Y - radius * 0.25;
  const mouthY = GLYPH_CENTER_Y + radius * 0.53;
  const mouthControlY = GLYPH_CENTER_Y + radius * 0.12;

  return (
    <>
      <circle cx={GLYPH_CENTER_X} cy={GLYPH_CENTER_Y} r={radius} />
      <line
        x1={GLYPH_CENTER_X - eyeOffsetX}
        y1={eyeY}
        x2={GLYPH_CENTER_X - eyeOffsetX}
        y2={eyeY + 1}
      />
      <line
        x1={GLYPH_CENTER_X + eyeOffsetX}
        y1={eyeY}
        x2={GLYPH_CENTER_X + eyeOffsetX}
        y2={eyeY + 1}
      />
      <path
        d={`M${GLYPH_CENTER_X - radius * 0.47} ${mouthY} Q${GLYPH_CENTER_X} ${mouthControlY} ${GLYPH_CENTER_X + radius * 0.47} ${mouthY}`}
      />
    </>
  );
};

export const CistercianGlyph = forwardRef<SVGSVGElement, CistercianGlyphProps>(
  function CistercianGlyph({ isValid, displayValue, glyphPathD, viewBox }, ref) {
    const activeViewBox = isValid ? viewBox : SVG_VIEWBOX;

    return (
      <svg
        ref={ref}
        viewBox={activeViewBox}
        role="img"
        aria-label={isValid ? `Cistercian glyph for ${displayValue}` : 'Invalid number sad face'}
        className={`block h-full w-full overflow-visible transition-colors duration-300 ${
          isValid ? 'text-zinc-950 dark:text-zinc-50' : 'text-red-600 dark:text-red-400'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth={GLYPH_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isValid ? <path d={glyphPathD} /> : <InvalidGlyph />}
      </svg>
    );
  },
);
