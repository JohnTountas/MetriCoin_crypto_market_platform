import { useEffect, useState } from 'react';

import { useAppStore } from '@/app/appStore';
import type { ThemePreference } from '@/shared/types/app';

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const useTheme = () => {
  const themePreference = useAppStore((state) => state.themePreference);
  const setThemePreference = useAppStore((state) => state.setThemePreference);
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() =>
    themePreference === 'system' ? getSystemTheme() : themePreference,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (preference: ThemePreference) => {
      const nextTheme = preference === 'system' ? getSystemTheme() : preference;
      setResolvedTheme(nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      document.documentElement.dataset.theme = nextTheme;
    };

    applyTheme(themePreference);

    const handleChange = () => {
      if (themePreference === 'system') {
        applyTheme(themePreference);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  return {
    themePreference,
    resolvedTheme,
    setThemePreference,
  };
};
