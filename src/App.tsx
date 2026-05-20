import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { clampGlyphNumber, getGlyphPaths } from './cistercian';
import './App.css';

const SVG_SIZE = 320;
const MAX_GLYPH_VALUE = 9999;
const GLYPH_STROKE_WIDTH = 4;

const normalizeInputValue = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '');

  if (digitsOnly === '') {
    return '';
  }

  return digitsOnly.replace(/^0+(?=\d)/, '');
};

const svgToTransparentPngBlob = async (svg: SVGSVGElement): Promise<Blob> => {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(SVG_SIZE));
  clone.setAttribute('height', String(SVG_SIZE));

  const svgText = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.decoding = 'async';

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Could not render the SVG for copying.'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = SVG_SIZE;
    canvas.height = SVG_SIZE;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas is unavailable in this browser.');
    }

    context.clearRect(0, 0, SVG_SIZE, SVG_SIZE);
    context.drawImage(image, 0, 0, SVG_SIZE, SVG_SIZE);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('Could not create a PNG blob from the glyph.'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
};

function App() {
  const [inputValue, setInputValue] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copyMessage, setCopyMessage] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  const parsedInput = useMemo(() => {
    if (inputValue === '') {
      return 0;
    }

    const parsed = Number.parseInt(inputValue, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [inputValue]);

  const validationMessage =
    parsedInput > MAX_GLYPH_VALUE ? `Please enter a number from 0 to ${MAX_GLYPH_VALUE}.` : '';
  const isValid = validationMessage === '';

  const numberValue = useMemo(() => {
    return clampGlyphNumber(parsedInput);
  }, [parsedInput]);

  const glyphPaths = useMemo(() => getGlyphPaths(numberValue), [numberValue]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleInputChange = (value: string) => {
    setCopyStatus('idle');
    setCopyMessage('');

    if (value === '') {
      setInputValue('');
      return;
    }

    setInputValue(normalizeInputValue(value));
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.'].includes(event.key)) {
      event.preventDefault();
    }
  };

  const handleCopy = async () => {
    setCopyStatus('idle');
    setCopyMessage('');

    try {
      if (!svgRef.current) {
        throw new Error('No glyph is available to copy.');
      }

      if (!isValid) {
        throw new Error('Enter a valid number before copying.');
      }

      if (!('ClipboardItem' in window) || !navigator.clipboard?.write) {
        throw new Error('This browser does not support copying image blobs.');
      }

      const pngBlob = await svgToTransparentPngBlob(svgRef.current);
      await navigator.clipboard.write([
        new ClipboardItem({
          [pngBlob.type]: pngBlob,
        }),
      ]);

      setCopyStatus('success');
      setCopyMessage('Copied transparent PNG');
    } catch (error) {
      setCopyStatus('error');
      setCopyMessage(error instanceof Error ? error.message : 'Copy failed.');
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-6 py-10 text-zinc-950 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      <main className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex w-full items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Decimal to Cistercian numerals
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Cistercian Glyph</h1>
          </div>

          <button
            type="button"
            aria-pressed={isDark}
            onClick={() => setIsDark((value) => !value)}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:border-zinc-500 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-400 dark:hover:bg-zinc-900"
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>

        <label className="w-full">
          <input
            type="number"
            min={0}
            max={9999}
            inputMode="numeric"
            value={inputValue}
            aria-invalid={!isValid}
            aria-describedby={validationMessage ? 'number-error' : undefined}
            onChange={(event) => handleInputChange(event.target.value)}
            onKeyDown={handleInputKeyDown}
            className={`h-12 w-full rounded-lg border bg-white px-4 text-center text-xl font-semibold tabular-nums outline-none transition-colors duration-300 placeholder:text-zinc-400 focus:ring-2 dark:bg-zinc-900 ${isValid
                ? 'border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10 dark:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10'
                : 'border-red-500 text-red-700 focus:border-red-600 focus:ring-red-500/15 dark:border-red-400 dark:text-red-300 dark:focus:border-red-300 dark:focus:ring-red-400/20'
              }`}
            placeholder="0-9999"
          />
          <p
            id="number-error"
            className="mt-2 min-h-5 text-sm font-medium text-red-600 dark:text-red-400"
            aria-live="polite"
          >
            {validationMessage}
          </p>
        </label>

        <section className="flex w-full flex-col items-center gap-5">
          <div className="grid aspect-square w-64 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50">
            <svg
              ref={svgRef}
              viewBox="0 0 100 100"
              role="img"
              aria-label={
                isValid ? `Cistercian glyph for ${numberValue}` : 'Invalid number sad face'
              }
              className="h-48 w-48"
              style={{ color: isValid ? (isDark ? '#fafafa' : '#09090b') : '#dc2626' }}
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
                  width="100"
                  height="100"
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
                    <path
                      key={path.id}
                      d={path.points
                        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                        .join(' ')}
                    />
                  ))}
                </g>
              ) : (
                <>
                  <circle cx="50" cy="50" r="32" />
                  <line x1="38" y1="42" x2="38" y2="43" />
                  <line x1="62" y1="42" x2="62" y2="43" />
                  <path d="M35 66 Q50 54 65 66" />
                </>
              )}
            </svg>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!isValid}
            className="h-11 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-50 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-300 dark:focus:ring-offset-zinc-950 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
          >
            Copy image
          </button>

          <p
            className={`min-h-5 text-center text-sm ${copyStatus === 'error'
                ? 'text-red-600 dark:text-red-400'
                : 'text-zinc-500 dark:text-zinc-400'
              }`}
            aria-live="polite"
          >
            {copyMessage}
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
