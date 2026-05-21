import { useMemo, useState } from 'react';
import {
  getStemCount,
  getUnifiedGlyphPathD,
  isGlyphInputInRange,
  normalizeGlyphInput,
} from '../glyph/cistercian';
import { getGlyphContentAspectRatio, getGlyphViewBox } from '../glyph/glyphGeometry';

export const useGlyphInput = () => {
  const [inputValue, setInputValue] = useState('');

  const normalizedInput = useMemo(() => normalizeGlyphInput(inputValue), [inputValue]);

  const isValid = inputValue === '' || isGlyphInputInRange(inputValue);
  const validationMessage = isValid || inputValue === '' ? '' : 'Out of range';

  const displayValue = inputValue === '' ? '0' : normalizedInput;
  const stemCount = useMemo(
    () => (isValid ? getStemCount(normalizedInput) : 1),
    [isValid, normalizedInput],
  );
  const glyphPathD = useMemo(() => getUnifiedGlyphPathD(normalizedInput), [normalizedInput]);
  const viewBox = useMemo(() => getGlyphViewBox(stemCount), [stemCount]);
  const aspectRatio = useMemo(() => getGlyphContentAspectRatio(stemCount), [stemCount]);

  return {
    inputValue,
    displayValue,
    glyphPathD,
    viewBox,
    aspectRatio,
    isValid,
    validationMessage,
    handleChange: setInputValue,
  };
};
