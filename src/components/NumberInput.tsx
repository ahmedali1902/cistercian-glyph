import { type ChangeEvent, type KeyboardEvent, useLayoutEffect, useRef } from 'react';
import { formatDigitsWithCommas, stripInputDigits } from '../glyph/cistercian';

type NumberInputProps = {
  value: string;
  isValid: boolean;
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

export const NumberInput = ({ value, isValid, onChange }: NumberInputProps) => {
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
    const nextValue = stripInputDigits(input.value);

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
      updateValue(
        stripInputDigits(`${value.slice(0, startDigit)}${event.key}${value.slice(endDigit)}`),
        startDigit + 1,
      );
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();

      if (startDigit !== endDigit) {
        updateValue(
          stripInputDigits(`${value.slice(0, startDigit)}${value.slice(endDigit)}`),
          startDigit,
        );
        return;
      }

      if (startDigit === 0) {
        return;
      }

      updateValue(
        stripInputDigits(`${value.slice(0, startDigit - 1)}${value.slice(startDigit)}`),
        startDigit - 1,
      );
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();

      if (startDigit !== endDigit) {
        updateValue(
          stripInputDigits(`${value.slice(0, startDigit)}${value.slice(endDigit)}`),
          startDigit,
        );
        return;
      }

      if (startDigit >= value.length) {
        return;
      }

      updateValue(
        stripInputDigits(`${value.slice(0, startDigit)}${value.slice(startDigit + 1)}`),
        startDigit,
      );
    }
  };

  return (
    <label className="w-full">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={formattedValue}
        aria-invalid={!isValid}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`h-12 w-full rounded-lg border bg-white px-4 text-center text-xl font-semibold tabular-nums outline-none transition-colors duration-300 placeholder:text-zinc-400 focus:ring-2 dark:bg-zinc-900 ${
          isValid
            ? 'border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10 dark:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10'
            : 'border-red-500 text-red-700 focus:border-red-600 focus:ring-red-500/15 dark:border-red-400 dark:text-red-300 dark:focus:border-red-300 dark:focus:ring-red-400/20'
        }`}
        placeholder="Enter a number"
      />
    </label>
  );
};
