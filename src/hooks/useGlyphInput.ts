import { useEffect, useMemo, useState } from 'react';
import { clampGlyphInput, getGlyphStems, normalizeGlyphInput } from '../glyph/cistercian';
import { getGlyphContentAspectRatio, getGlyphViewBox } from '../glyph/glyphGeometry';

/** The number lives in the URL hash (e.g. `#2026`) so any glyph can be shared as a link. */
const readHash = () => {
  try {
    return clampGlyphInput(decodeURIComponent(window.location.hash.slice(1)));
  } catch {
    return '';
  }
};

const writeHash = (value: string) => {
  const { pathname, search, hash } = window.location;
  const nextHash = value ? `#${value}` : '';

  if (hash === nextHash) {
    return;
  }

  // replaceState keeps typing out of the back-button history.
  window.history.replaceState(window.history.state, '', `${pathname}${search}${nextHash}`);
};

export const useGlyphInput = () => {
  const [inputValue, setInputValue] = useState(readHash);

  useEffect(() => {
    writeHash(inputValue);
  }, [inputValue]);

  useEffect(() => {
    const handleHashChange = () => setInputValue(readHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isEmpty = inputValue === '';
  const displayValue = useMemo(() => normalizeGlyphInput(inputValue), [inputValue]);
  const stems = useMemo(() => getGlyphStems(displayValue), [displayValue]);
  const viewBox = useMemo(() => getGlyphViewBox(stems.length), [stems.length]);
  const aspectRatio = useMemo(() => getGlyphContentAspectRatio(stems.length), [stems.length]);

  return {
    inputValue,
    displayValue,
    stems,
    viewBox,
    aspectRatio,
    isEmpty,
    handleChange: (value: string) => setInputValue(clampGlyphInput(value)),
  };
};
