import { type RefObject } from 'react';
import { type GlyphPath } from '../glyph/cistercian';
import { CistercianGlyph } from './CistercianGlyph';
import { CopyGlyphButton } from './CopyGlyphButton';

type GlyphPreviewProps = {
  svgRef: RefObject<SVGSVGElement | null>;
  isValid: boolean;
  numberValue: number;
  glyphPaths: GlyphPath[];
  copyStatus: 'idle' | 'success' | 'error';
  copyMessage: string;
  onCopy: () => void;
};

export const GlyphPreview = ({
  svgRef,
  isValid,
  numberValue,
  glyphPaths,
  copyStatus,
  copyMessage,
  onCopy,
}: GlyphPreviewProps) => (
  <section className="flex w-full flex-col items-center gap-5">
    <CistercianGlyph
      ref={svgRef}
      isValid={isValid}
      numberValue={numberValue}
      glyphPaths={glyphPaths}
    />

    <CopyGlyphButton
      disabled={!isValid}
      status={copyStatus}
      message={copyMessage}
      onCopy={onCopy}
    />
  </section>
);
