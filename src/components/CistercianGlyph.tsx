import { forwardRef } from 'react';
import { type GlyphPath, pointsToPathD } from '../cistercian';
import { GLYPH_STROKE_WIDTH } from '../constants';
import { SVG_VIEWBOX, VIEWBOX_SIZE } from '../glyphGeometry';
import { InvalidGlyph } from './InvalidGlyph';

type CistercianGlyphProps = {
  isValid: boolean;
  numberValue: number;
  glyphPaths: GlyphPath[];
};

export const CistercianGlyph = forwardRef<SVGSVGElement, CistercianGlyphProps>(
  function CistercianGlyph({ isValid, numberValue, glyphPaths }, ref) {
    return (
      <div className="grid aspect-square w-64 place-items-center rounded-lg border border-zinc-200 bg-white shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900">
        <svg
          ref={ref}
          viewBox={SVG_VIEWBOX}
          role="img"
          aria-label={isValid ? `Cistercian glyph for ${numberValue}` : 'Invalid number sad face'}
          className={`h-48 w-48 transition-colors duration-300 ${isValid ? 'text-zinc-950 dark:text-zinc-50' : 'text-red-600 dark:text-red-400'
            }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={GLYPH_STROKE_WIDTH}
          strokeLinecap="butt"
          strokeLinejoin="miter"
        >
          <defs>
            <filter
              id="glyph-join-closure"
              x="0"
              y="0"
              width={String(VIEWBOX_SIZE)}
              height={String(VIEWBOX_SIZE)}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feMorphology in="SourceGraphic" operator="dilate" radius="0.45" result="grown" />
              <feMorphology in="grown" operator="erode" radius="0.45" />
            </filter>
          </defs>
          {isValid ? (
            <g filter="url(#glyph-join-closure)">
              {glyphPaths.map((path) => (
                <path key={path.id} d={pointsToPathD(path.points)} />
              ))}
            </g>
          ) : (
            <InvalidGlyph />
          )}
        </svg>
      </div>
    );
  },
);
