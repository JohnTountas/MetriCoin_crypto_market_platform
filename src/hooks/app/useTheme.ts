// useTheme resolves stored preference, system preference, and document state into one small API.
// Theme bugs usually come from this boundary rather than from individual components.
import { useEffect, useMemo, useState } from 'react';

import { useAppStore } from '@/app';
import type { ThemePreference } from '@/shared/types';

const themePreferences = ['dark', 'light', 'system'] as const;

const isThemePreference = (value: unknown): value is ThemePreference =>
  typeof value === 'string' &&
  themePreferences.includes(value as ThemePreference);

const normalizeThemePreference = (value: unknown): ThemePreference =>
  isThemePreference(value) ? value : 'system';

const applyThemeToDocument = (theme: 'dark' | 'light') => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
};

const getSystemTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = () => {
  const themePreference = useAppStore((state) => state.themePreference);
  const storeThemePreference = useAppStore((state) => state.setThemePreference);
  const normalizedThemePreference = useMemo(
    () => normalizeThemePreference(themePreference),
    [themePreference],
  );
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() =>
    getSystemTheme(),
  );
  const resolvedTheme = normalizedThemePreference === 'system'
    ? systemTheme
    : normalizedThemePreference;

  const setThemePreference = (nextThemePreference: ThemePreference) => {
    const normalizedPreference = normalizeThemePreference(nextThemePreference);
    const nextResolvedTheme =
      normalizedPreference === 'system' ? getSystemTheme() : normalizedPreference;

    applyThemeToDocument(nextResolvedTheme);
    setSystemTheme(nextResolvedTheme);
    storeThemePreference(normalizedPreference);
  };

  useEffect(() => {
    if (themePreference !== normalizedThemePreference) {
      storeThemePreference(normalizedThemePreference);
    }
  }, [normalizedThemePreference, storeThemePreference, themePreference]);

  useEffect(() => {
    applyThemeToDocument(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setSystemTheme(getSystemTheme());

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return {
    themePreference: normalizedThemePreference,
    resolvedTheme,
    setThemePreference,
  };
};
