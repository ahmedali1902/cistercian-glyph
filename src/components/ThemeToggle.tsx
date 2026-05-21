type ThemeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
};

const SunIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm4 3a1 1 0 0 1 .707.293l.707.707a1 1 0 1 1-1.414 1.414l-.707-.707A1 1 0 0 1 14 5ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm7 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm-2.293 4.707a1 1 0 0 1 1.414 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707ZM10 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm-5.707-1.293a1 1 0 0 1-1.414 1.414l.707.707a1 1 0 1 1 1.414-1.414l-.707-.707ZM3 10a1 1 0 0 1-1 1H1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm1.293-5.707a1 1 0 0 1 0 1.414l-.707.707A1 1 0 0 1 2.172 4.88l.707-.707a1 1 0 0 1 1.414 0Z"
      clipRule="evenodd"
    />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
    <path d="M15.98 12.38A7 7 0 1 1 7.62 4.02 5.5 5.5 0 0 0 15.98 12.38Z" />
  </svg>
);

export const ThemeToggle = ({ isDark, onToggle }: ThemeToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={isDark}
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    onClick={onToggle}
    className="group relative h-9 w-17 shrink-0 rounded-full border border-zinc-300 bg-zinc-200/80 p-1 transition-colors duration-300 ease-out hover:border-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/90 dark:hover:border-zinc-500 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
  >
    <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
      <span
        className={`text-amber-500 transition-all duration-300 ease-out ${isDark ? 'scale-75 opacity-35' : 'scale-100 opacity-100'
          }`}
      >
        <SunIcon />
      </span>
      <span
        className={`text-indigo-300 transition-all duration-300 ease-out ${isDark ? 'scale-100 opacity-100' : 'scale-75 opacity-35'
          }`}
      >
        <MoonIcon />
      </span>
    </span>

    <span
      className={`pointer-events-none absolute top-1 left-1 h-7 w-7 rounded-full bg-white shadow-sm ring-1 ring-zinc-900/5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.45,0.64,1)] dark:bg-zinc-100 dark:ring-white/10 ${isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
    />
  </button>
);
