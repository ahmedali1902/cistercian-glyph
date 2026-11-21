import { useEffect, useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';

// The initial theme is applied by an inline script in index.html before first paint,
// so there's no light flash for dark-mode users. Keep the storage key in sync with it.
const STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

type StoredTheme = 'dark' | 'light' | null;

const readStoredTheme = (): StoredTheme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
};

const storeTheme = (isDark: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch {
    // Storage can be unavailable (e.g. privacy mode); the toggle still works for this visit.
  }
};

/** While the themes cross-fade, normal colour transitions are paused (see App.css). */
const SWITCHING_CLASS = 'theme-switching';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Switches theme with a soft cross-fade of the whole page (timing lives in App.css).
 * Falls back to an instant switch when the browser has no View Transitions or the user
 * prefers reduced motion.
 */
const runThemeTransition = (update: () => void) => {
  if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
    update();
    return;
  }

  const root = document.documentElement;
  root.classList.add(SWITCHING_CLASS);
  const transition = document.startViewTransition(update);
  void transition.finished.finally(() => root.classList.remove(SWITCHING_CLASS));
};

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Follow the OS setting live until the user picks a theme explicitly.
  useEffect(() => {
    if (readStoredTheme() !== null) {
      return;
    }

    const media = window.matchMedia(DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (readStoredTheme() === null) {
        setIsDark(event.matches);
      }
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggle = () => {
    const next = !isDark;
    storeTheme(next);
    // flushSync so the DOM is updated inside the view-transition callback, which is what
    // lets the browser capture the "after" state to fade to.
    runThemeTransition(() => flushSync(() => setIsDark(next)));
  };

  return { isDark, toggle };
};
