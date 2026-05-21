import moonIcon from '../assets/icons/moon.svg?raw';
import sunIcon from '../assets/icons/sun.svg?raw';
import { Icon } from './Icon';

const trackIconClass = 'h-3.5 w-3.5';
const thumbIconClass = 'h-3.5 w-3.5';

const ThemeToggle = ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={isDark}
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    onClick={onToggle}
    className="relative inline-flex h-8 w-14 shrink-0 rounded-full border border-zinc-300 bg-zinc-200/90 p-0.5 transition-colors duration-300 ease-out hover:border-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-zinc-500 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
  >
    <span className="pointer-events-none flex w-full items-center justify-between px-1.5">
      <span className={`text-amber-500 transition-opacity duration-300 ${isDark ? 'opacity-35' : 'opacity-0'}`}>
        <Icon src={sunIcon} className={trackIconClass} />
      </span>
      <span className={`text-indigo-400 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-35'}`}>
        <Icon src={moonIcon} className={trackIconClass} />
      </span>
    </span>

    <span
      className={`pointer-events-none absolute top-0.5 left-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-900/5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.45,0.64,1)] dark:bg-zinc-100 dark:ring-white/10 ${isDark ? 'translate-x-6 text-indigo-400' : 'translate-x-0 text-amber-500'
        }`}
    >
      <Icon src={isDark ? moonIcon : sunIcon} className={thumbIconClass} />
    </span>
  </button>
);

export const Header = ({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) => (
  <div className="flex w-full items-center justify-between gap-4">
    <div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Decimal to Cistercian numerals
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-normal">Cistercian Glyph</h1>
    </div>

    <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
  </div>
);
