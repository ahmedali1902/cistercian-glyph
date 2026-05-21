import { type KeyboardEvent } from 'react';
import { MAX_GLYPH_VALUE } from '../glyph/glyphGeometry';

type NumberInputProps = {
  value: string;
  isValid: boolean;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export const NumberInput = ({ value, isValid, onChange, onKeyDown }: NumberInputProps) => (
  <label className="w-full">
    <input
      type="number"
      min={0}
      max={MAX_GLYPH_VALUE}
      inputMode="numeric"
      value={value}
      aria-invalid={!isValid}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      className={`h-12 w-full rounded-lg border bg-white px-4 text-center text-xl font-semibold tabular-nums outline-none transition-colors duration-300 placeholder:text-zinc-400 focus:ring-2 dark:bg-zinc-900 ${isValid
          ? 'border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10 dark:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10'
          : 'border-red-500 text-red-700 focus:border-red-600 focus:ring-red-500/15 dark:border-red-400 dark:text-red-300 dark:focus:border-red-300 dark:focus:ring-red-400/20'
        }`}
      placeholder={`0-${MAX_GLYPH_VALUE}`}
    />
  </label>
);
