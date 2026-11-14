/* Appearance preference: 'system' | 'light' | 'dark' (per-device convenience). */

const KEY = 'theme';

export function getTheme() {
  try { return localStorage.getItem(KEY) || 'system'; } catch { return 'system'; }
}

export function applyTheme(theme = getTheme()) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  else delete root.dataset.theme;
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute('content', dark ? '#000000' : '#f5f5f7');
  });
}

export function setTheme(theme) {
  try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
  applyTheme(theme);
}

matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => applyTheme());
