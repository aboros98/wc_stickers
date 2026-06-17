export type Theme = 'dark' | 'light'

const KEY = 'wc26-theme'

export function getTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyTheme(theme: Theme): void {
  const el = document.documentElement
  if (theme === 'light') el.classList.add('light')
  else el.classList.remove('light')
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* ignore storage failures (private mode, etc.) */
  }
}
