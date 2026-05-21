import { type KeyboardEvent, useMemo, useState } from 'react';
import { clampGlyphNumber, getGlyphPaths } from '../cistercian';
import { MAX_GLYPH_VALUE } from '../constants';
import { normalizeInputValue } from '../utils/normalizeInput';

export const useGlyphInput = () => {
  const [inputValue, setInputValue] = useState('');

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

  const numberValue = useMemo(() => clampGlyphNumber(parsedInput), [parsedInput]);
  const glyphPaths = useMemo(() => getGlyphPaths(numberValue), [numberValue]);

  const handleChange = (value: string) => {
    if (value === '') {
      setInputValue('');
      return;
    }

    setInputValue(normalizeInputValue(value));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.'].includes(event.key)) {
      event.preventDefault();
    }
  };

  return {
    inputValue,
    numberValue,
    glyphPaths,
    isValid,
    validationMessage,
    handleChange,
    handleKeyDown,
  };
};
