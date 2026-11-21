import { type Ref, useLayoutEffect, useRef, useState } from 'react';
import { type GlyphStem } from '../glyph/cistercian';
import { GLYPH_FRAME_PADDING, GLYPH_HEIGHT } from '../glyph/glyphGeometry';
import { type GlyphHighlight } from '../glyph/highlight';
import { CistercianGlyph } from './CistercianGlyph';

/**
 * Glyph height in the preview. The card's height depends only on the screen width (never on
 * the number), so nothing below it moves while typing. Narrow screens get a shorter card so a
 * shrunk multi-stem glyph doesn't float in empty space.
 */
const PREVIEW_HEIGHT_REM = 12;
const COMPACT_PREVIEW_HEIGHT_REM = 9;
const COMPACT_BELOW_REM = 36; // ~576px of available width

const framePaddingRem = (previewHeightRem: number) =>
  (GLYPH_FRAME_PADDING / GLYPH_HEIGHT) * previewHeightRem;

type GlyphPreviewProps = {
  svgRef: Ref<SVGSVGElement>;
  displayValue: string;
  stems: GlyphStem[];
  viewBox: string;
  aspectRatio: number;
  highlight: GlyphHighlight | null;
};

const getRootFontSizePx = () =>
  Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

/** Tracks the width available to the preview so wide (multi-stem) glyphs can shrink to fit. */
const useAvailableWidthRem = () => {
  const ref = useRef<HTMLElement>(null);
  const [widthRem, setWidthRem] = useState<number | null>(null);
  // Size animations stay off until the first measurement has been painted, so the card
  // doesn't visibly resize on page load.
  const [isMeasured, setIsMeasured] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const update = (widthPx: number) => setWidthRem(widthPx / getRootFontSizePx());
    update(element.clientWidth);
    const frame = requestAnimationFrame(() => setIsMeasured(true));
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        update(entry.contentRect.width);
      }
    });
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return { ref, widthRem, isMeasured };
};

export const GlyphPreview = ({
  svgRef,
  displayValue,
  stems,
  viewBox,
  aspectRatio,
  highlight,
}: GlyphPreviewProps) => {
  const { ref: sectionRef, widthRem, isMeasured } = useAvailableWidthRem();

  // Full size when it fits; otherwise the glyph scales down to the available width while
  // the card keeps its height and the glyph stays vertically centred inside it.
  const previewHeightRem =
    widthRem !== null && widthRem < COMPACT_BELOW_REM
      ? COMPACT_PREVIEW_HEIGHT_REM
      : PREVIEW_HEIGHT_REM;
  const paddingRem = framePaddingRem(previewHeightRem);
  const shellHeightRem = previewHeightRem + 2 * paddingRem;

  const naturalContentWidthRem = previewHeightRem * aspectRatio;
  const maxContentWidthRem = widthRem === null ? naturalContentWidthRem : widthRem - 2 * paddingRem;
  const scale = Math.min(1, maxContentWidthRem / naturalContentWidthRem);
  const glyphHeightRem = previewHeightRem * scale;
  const contentWidthRem = glyphHeightRem * aspectRatio;
  const shellWidthRem = contentWidthRem + 2 * paddingRem;

  return (
    <section ref={sectionRef} className="flex w-full justify-center">
      <div
        className={`glyph-preview-shell surface relative rounded-2xl ${isMeasured ? 'is-animated' : ''}`}
        style={{ width: `${shellWidthRem}rem`, height: `${shellHeightRem}rem` }}
      >
        <div
          className="absolute inset-y-0 right-0 flex items-center"
          style={{ paddingInline: `${paddingRem}rem` }}
        >
          <div
            className="glyph-preview-content"
            style={{ width: `${contentWidthRem}rem`, height: `${glyphHeightRem}rem` }}
          >
            <CistercianGlyph
              ref={svgRef}
              displayValue={displayValue}
              stems={stems}
              viewBox={viewBox}
              highlight={highlight}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
