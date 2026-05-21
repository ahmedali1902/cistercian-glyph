import { useLayoutEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

const applyDarkClass = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark);
};

const getInitialDark = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') {
    return true;
  }
  if (stored === 'light') {
    return false;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const runThemeTransition = (update: () => void) => {
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(update);
    return;
  }

  update();
};

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(getInitialDark);

  useLayoutEffect(() => {
    applyDarkClass(isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => {
    runThemeTransition(() => {
      setIsDark((value) => !value);
    });
  };

  return { isDark, toggle };
};

applyDarkClass(getInitialDark());
