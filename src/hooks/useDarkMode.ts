import { useLayoutEffect, useState } from 'react';

const applyDarkClass = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark);
};

const runThemeTransition = (update: () => void) => {
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(update);
    return;
  }

  update();
};

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useLayoutEffect(() => {
    applyDarkClass(isDark);
  }, [isDark]);

  const toggle = () => {
    runThemeTransition(() => {
      setIsDark((value) => !value);
    });
  };

  return { isDark, toggle };
};
