import { randomGlyphNumber } from '../glyph/random';

const linkClass =
  'rounded px-1 font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 transition-colors duration-200 hover:text-zinc-950 hover:decoration-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 dark:text-zinc-300 dark:decoration-zinc-700 dark:hover:text-zinc-50 dark:hover:decoration-zinc-400';

type ExamplePickerProps = {
  current: string;
  onPick: (value: string) => void;
};

export const ExamplePicker = ({ current, onPick }: ExamplePickerProps) => (
  <p className="-mt-4 text-sm text-zinc-500 dark:text-zinc-400">
    Try{' '}
    <button
      type="button"
      className={linkClass}
      onClick={() => onPick(String(new Date().getFullYear()))}
    >
      this year
    </button>{' '}
    or a{' '}
    <button type="button" className={linkClass} onClick={() => onPick(randomGlyphNumber(current))}>
      random number
    </button>
  </p>
);
