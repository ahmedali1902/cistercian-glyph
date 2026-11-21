import { useRef, useState } from 'react';
import { ExamplePicker } from './components/ExamplePicker';
import { GlyphBreakdown } from './components/GlyphBreakdown';
import { GlyphPreview } from './components/GlyphPreview';
import { Header } from './components/Header';
import { NumberInput } from './components/NumberInput';
import { ShareMenu } from './components/ShareMenu';
import { type GlyphHighlight } from './glyph/highlight';
import { useDarkMode } from './hooks/useDarkMode';
import { useGlyphExport } from './hooks/useGlyphExport';
import { useGlyphInput } from './hooks/useGlyphInput';
import './App.css';

function App() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isDark, toggle: toggleTheme } = useDarkMode();
  const glyph = useGlyphInput();
  // Exports use the current theme's stroke colour, so the file name says which one.
  const glyphExport = useGlyphExport(
    svgRef,
    `cistercian-${glyph.displayValue}-${isDark ? 'dark' : 'light'}`,
  );
  const [highlight, setHighlight] = useState<GlyphHighlight | null>(null);
  // Ignore a highlight that points past the last stem (e.g. after the number got shorter).
  const activeHighlight =
    highlight && (highlight.stem === null || highlight.stem < glyph.stems.length)
      ? highlight
      : null;

  const handleInputChange = (value: string) => {
    setHighlight(null);
    glyph.handleChange(value);
  };

  return (
    // Top-anchored (not vertically centred) so content that grows below the input — a wider
    // glyph, more breakdown rows — never pushes the header and input around.
    <div className="app-backdrop flex min-h-dvh justify-center px-5 pt-[max(3rem,12vh)] pb-16 text-zinc-950 sm:px-8 dark:text-zinc-50">
      <main className="flex w-full max-w-5xl flex-col items-center gap-8">
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          <Header isDark={isDark} onToggleTheme={toggleTheme} />

          <NumberInput value={glyph.inputValue} onChange={handleInputChange} />

          <ExamplePicker current={glyph.inputValue} onPick={handleInputChange} />
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          <GlyphPreview
            svgRef={svgRef}
            displayValue={glyph.displayValue}
            stems={glyph.stems}
            viewBox={glyph.viewBox}
            aspectRatio={glyph.aspectRatio}
            highlight={activeHighlight}
          />

          <ShareMenu
            onCopyImage={glyphExport.copyImage}
            onCopyLink={glyphExport.copyLink}
            onDownloadPng={glyphExport.downloadPng}
            onDownloadSvg={glyphExport.downloadSvg}
          />
        </div>

        {!glyph.isEmpty && (
          <GlyphBreakdown
            stems={glyph.stems}
            highlight={activeHighlight}
            onHighlightChange={setHighlight}
          />
        )}
      </main>
    </div>
  );
}

export default App;
