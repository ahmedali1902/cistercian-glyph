import { useRef } from 'react';
import { GlyphPreview } from './components/GlyphPreview';
import { Header } from './components/Header';
import { NumberInput } from './components/NumberInput';
import { useCopyGlyph } from './hooks/useCopyGlyph';
import { useDarkMode } from './hooks/useDarkMode';
import { useGlyphInput } from './hooks/useGlyphInput';
import './App.css';

function App() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isDark, toggle: toggleTheme } = useDarkMode();
  const glyph = useGlyphInput();
  const copy = useCopyGlyph(svgRef, glyph.isValid);

  const handleInputChange = (value: string) => {
    copy.reset();
    glyph.handleChange(value);
  };

  const handleCopy = () => {
    void copy.copy();
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-6 py-10 text-zinc-950 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      <main className="flex w-full max-w-md flex-col items-center gap-8">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />

        <NumberInput
          value={glyph.inputValue}
          isValid={glyph.isValid}
          validationMessage={glyph.validationMessage}
          onChange={handleInputChange}
          onKeyDown={glyph.handleKeyDown}
        />

        <GlyphPreview
          svgRef={svgRef}
          isValid={glyph.isValid}
          numberValue={glyph.numberValue}
          glyphPathD={glyph.glyphPathD}
          copyStatus={copy.status}
          copyMessage={copy.message}
          onCopy={handleCopy}
        />
      </main>
    </div>
  );
}

export default App;
