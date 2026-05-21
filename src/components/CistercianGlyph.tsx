import { forwardRef } from 'react';
import { GLYPH_STROKE_WIDTH, SVG_VIEWBOX } from '../glyph/glyphGeometry';

type CistercianGlyphProps = {
  isValid: boolean;
  numberValue: number;
  glyphPathD: string;
};

const InvalidGlyph = () => (
  <>
    <circle cx="50" cy="50" r="32" />
    <line x1="38" y1="42" x2="38" y2="43" />
    <line x1="62" y1="42" x2="62" y2="43" />
    <path d="M35 66 Q50 54 65 66" />
  </>
);

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
