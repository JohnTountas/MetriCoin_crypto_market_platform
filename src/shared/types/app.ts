export type ThemePreference = 'dark' | 'light' | 'system';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export type Toast = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

export type CommandAction = {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  path?: string;
  action?: () => void;
};

