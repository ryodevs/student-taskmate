import { load, save } from './storage';

export type Theme = 'light' | 'dark';

export function getInitialTheme(): Theme {
  const saved = load<Theme | null>('taskmate:theme', null);

  if (saved === 'light' || saved === 'dark') return saved;

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  save('taskmate:theme', theme);
}
