import { useState } from 'react';
import moonIcon from '../assets/icons/moon.svg?raw';
import sunIcon from '../assets/icons/sun.svg?raw';
import { Icon } from './Icon';

type ThemeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
};

const ICON_SWAP =
  'absolute inset-0 m-auto h-3.5 w-3.5 transition-[opacity,rotate,scale] duration-300';

/**
 * A recessed track with a raised knob. The knob slides (and stretches a little while
 * pressed), wobbles like a droplet as it lands, and its sun/moon rotate as they swap.
 */
const ThemeToggle = ({ isDark, onToggle }: ThemeToggleProps) => {
  // Bumped on every click so the knob's droplet wobble replays (but not on first load).
  const [wobble, setWobble] = useState(0);

  const handleClick = () => {
    setWobble((count) => count + 1);
    onToggle();
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={handleClick}
      className="theme-toggle toggle-track group relative h-8 w-[3.75rem] shrink-0 rounded-full focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500"
    >
      {/* Hints on the empty side of the track: the theme you'd switch to. */}
      <Icon
        src={sunIcon}
        className={`pointer-events-none absolute top-1/2 left-[0.6rem] h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 transition-opacity duration-300 ${
          isDark ? 'opacity-70' : 'opacity-0'
        }`}
      />
      <Icon
        src={moonIcon}
        className={`pointer-events-none absolute top-1/2 right-[0.6rem] h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 transition-opacity duration-300 ${
          isDark ? 'opacity-0' : 'opacity-80'
        }`}
      />

      {/* Outer span slides (and stretches while pressed); inner span is the knob itself. */}
      <span
        data-thumb
        className={`pointer-events-none absolute top-[0.1875rem] left-[0.1875rem] h-[1.625rem] w-[1.625rem] transition-[translate,width] duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)] group-active:w-[1.875rem] group-active:duration-200 ${
          isDark ? 'translate-x-7 group-active:translate-x-6' : 'translate-x-0'
        }`}
      >
        <span
          key={wobble}
          className={`toggle-knob relative block h-full w-full rounded-full ${
            wobble > 0 ? (isDark ? 'droplet-right' : 'droplet-left') : ''
          }`}
        >
          <Icon
            src={sunIcon}
            className={`${ICON_SWAP} text-amber-500 ${
              isDark ? 'scale-50 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
            }`}
          />
          <Icon
            src={moonIcon}
            className={`${ICON_SWAP} text-indigo-200 ${
              isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 rotate-90 opacity-0'
            }`}
          />
        </span>
      </span>
    </button>
  );
};

export const Header = ({
  isDark,
  onToggleTheme,
}: {
  isDark: boolean;
  onToggleTheme: () => void;
}) => (
  <div className="flex w-full items-center justify-between gap-4">
    <h1 className="text-3xl font-semibold tracking-tight">Cistercian Glyph</h1>

    <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
  </div>
);
