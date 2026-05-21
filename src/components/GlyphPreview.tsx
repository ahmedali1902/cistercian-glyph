import { type RefObject } from 'react';
import { CistercianGlyph } from './CistercianGlyph';
import { CopyGlyphButton } from './CopyGlyphButton';

type GlyphPreviewProps = {
  svgRef: RefObject<SVGSVGElement | null>;
  isValid: boolean;
  numberValue: number;
  glyphPathD: string;
  copyStatus: 'idle' | 'success' | 'error';
  copyMessage: string;
  onCopy: () => void;
};

export const GlyphPreview = ({
  svgRef,
  isValid,
  numberValue,
  glyphPathD,
  copyStatus,
  copyMessage,
  onCopy,
}: GlyphPreviewProps) => (
  <section className="flex w-full flex-col items-center gap-5">
    <CistercianGlyph
      ref={svgRef}
      isValid={isValid}
      numberValue={numberValue}
      glyphPathD={glyphPathD}
    />

    <CopyGlyphButton
      disabled={!isValid}
      status={copyStatus}
      message={copyMessage}
      onCopy={onCopy}
    />
  </section>
);
