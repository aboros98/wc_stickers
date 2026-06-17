export type Theme = 'dark' | 'light'

const KEY = 'wc26-theme'

/** Light (Panini cream) is the default; dark only if explicitly chosen. */
export function getTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme: Theme): void {
  const el = document.documentElement
  if (theme === 'light') el.classList.add('light')
  else el.classList.remove('light')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'light' ? '#F4EFE3' : '#0A0A0C')
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* ignore storage failures (private mode, etc.) */
  }
}
