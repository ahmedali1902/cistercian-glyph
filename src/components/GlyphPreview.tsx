import { type RefObject } from 'react';
import checkIcon from '../assets/icons/check.svg?raw';
import copyIcon from '../assets/icons/copy.svg?raw';
import { CistercianGlyph } from './CistercianGlyph';
import { Icon } from './Icon';

type GlyphPreviewProps = {
  svgRef: RefObject<SVGSVGElement | null>;
  isValid: boolean;
  numberValue: number;
  glyphPathD: string;
  copyStatus: 'idle' | 'success';
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
}: GlyphPreviewProps) => {
  const isCopySuccess = copyStatus === 'success';

  return (
    <section className="flex w-full flex-col items-center">
      <div className="relative w-64">
        <CistercianGlyph
          ref={svgRef}
          isValid={isValid}
          numberValue={numberValue}
          glyphPathD={glyphPathD}
        />

        <button
          type="button"
          onClick={onCopy}
          disabled={!isValid}
          aria-label={isCopySuccess ? copyMessage : 'Copy glyph image'}
          title={isCopySuccess ? copyMessage : 'Copy image'}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200/80 bg-white/90 text-zinc-600 shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-500/60"
        >
          <span className="sr-only" aria-live="polite">
            {isCopySuccess ? copyMessage : ''}
          </span>
          <Icon src={isCopySuccess ? checkIcon : copyIcon} />
        </button>
      </div>
    </section>
  );
};
