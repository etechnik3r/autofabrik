export type ThemeId = 'system' | 'light' | 'dark' | 'wolfsburg' | 'getriebe';

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Hell' },
  { id: 'dark', label: 'Dunkel' },
  { id: 'wolfsburg', label: 'Wolfsburg' },
  { id: 'getriebe', label: 'Getriebe' },
];

const THEME_IDS = new Set(THEMES.map((t) => t.id));

export function isThemeId(x: string): x is ThemeId {
  return THEME_IDS.has(x as ThemeId);
}

export function applyTheme(id: ThemeId): void {
  document.documentElement.dataset.theme = id;
}
