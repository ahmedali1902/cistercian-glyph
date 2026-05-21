import { forwardRef } from 'react';
import { GLYPH_STROKE_WIDTH } from '../glyph/constants';
import { SVG_VIEWBOX } from '../glyph/glyphGeometry';
import { InvalidGlyph } from './InvalidGlyph';

type CistercianGlyphProps = {
  isValid: boolean;
  numberValue: number;
  glyphPathD: string;
};

export const CistercianGlyph = forwardRef<SVGSVGElement, CistercianGlyphProps>(
  function CistercianGlyph({ isValid, numberValue, glyphPathD }, ref) {
    return (
      <div className="grid aspect-square w-64 place-items-center rounded-lg border border-zinc-200 bg-white shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900">
        <svg
          ref={ref}
          viewBox={SVG_VIEWBOX}
          role="img"
          aria-label={isValid ? `Cistercian glyph for ${numberValue}` : 'Invalid number sad face'}
          className={`h-48 w-48 transition-colors duration-300 ${
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
      </div>
    );
  },
);
