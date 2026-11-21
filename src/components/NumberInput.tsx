import { type ChangeEvent, type KeyboardEvent, useLayoutEffect, useRef } from 'react';
import { clampGlyphInput, formatDigitsWithCommas, MAX_INPUT_DIGITS } from '../glyph/cistercian';

type NumberInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const BLOCKED_KEYS = new Set(['e', 'E', '+', '-', '.']);

const countDigitsBefore = (value: string, index: number) =>
  value.slice(0, index).replace(/\D/g, '').length;

const cursorAfterDigits = (formatted: string, digitIndex: number) => {
  if (digitIndex <= 0) {
    return 0;
  }

  let digitsSeen = 0;

  for (let index = 0; index < formatted.length; index += 1) {
    if (formatted[index] === ',') {
      continue;
    }

    digitsSeen += 1;

    if (digitsSeen === digitIndex) {
      return index + 1;
    }
  }

  return formatted.length;
};

export const NumberInput = ({ value, onChange }: NumberInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorDigitIndexRef = useRef<number | null>(null);
  const formattedValue = formatDigitsWithCommas(value);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const digitIndex = cursorDigitIndexRef.current;

    if (!input || digitIndex === null) {
      return;
    }

    const nextCursor = cursorAfterDigits(formattedValue, digitIndex);
    input.setSelectionRange(nextCursor, nextCursor);
    cursorDigitIndexRef.current = null;
  }, [formattedValue]);

  const updateValue = (nextRaw: string, cursorDigits: number) => {
    cursorDigitIndexRef.current = Math.max(0, Math.min(cursorDigits, nextRaw.length));
    onChange(nextRaw);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const cursor = input.selectionStart ?? input.value.length;
    const nextValue = clampGlyphInput(input.value);

    cursorDigitIndexRef.current = Math.min(
      countDigitsBefore(input.value, cursor),
      nextValue.length,
    );
    onChange(nextValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (BLOCKED_KEYS.has(event.key)) {
      event.preventDefault();
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const input = event.currentTarget;
    const selectionStart = input.selectionStart ?? formattedValue.length;
    const selectionEnd = input.selectionEnd ?? selectionStart;
    const startDigit = countDigitsBefore(formattedValue, selectionStart);
    const endDigit = countDigitsBefore(formattedValue, selectionEnd);

    if (/^\d$/.test(event.key)) {
      event.preventDefault();

      // Full: a new digit can only replace a selection, never extend the number.
      if (startDigit === endDigit && value.length >= MAX_INPUT_DIGITS) {
        return;
      }

      updateValue(
        clampGlyphInput(`${value.slice(0, startDigit)}${event.key}${value.slice(endDigit)}`),
        startDigit + 1,
      );
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();

      if (startDigit !== endDigit) {
        updateValue(
          clampGlyphInput(`${value.slice(0, startDigit)}${value.slice(endDigit)}`),
          startDigit,
        );
        return;
      }

      if (startDigit === 0) {
        return;
      }

      updateValue(
        clampGlyphInput(`${value.slice(0, startDigit - 1)}${value.slice(startDigit)}`),
        startDigit - 1,
      );
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();

      if (startDigit !== endDigit) {
        updateValue(
          clampGlyphInput(`${value.slice(0, startDigit)}${value.slice(endDigit)}`),
          startDigit,
        );
        return;
      }

      if (startDigit >= value.length) {
        return;
      }

      updateValue(
        clampGlyphInput(`${value.slice(0, startDigit)}${value.slice(startDigit + 1)}`),
        startDigit,
      );
    }
  };

  return (
    <label className="w-full">
      <span className="sr-only">Number to convert (up to {MAX_INPUT_DIGITS} digits)</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        value={formattedValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="field h-12 w-full rounded-xl px-4 text-center text-xl font-semibold tabular-nums outline-none placeholder:font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        placeholder="Enter a number"
      />
    </label>
  );
};
