export type Theme = 'dark' | 'light'

// v2: dark is the default now. v1 auto-persisted 'light' for everyone, so we use
// a fresh key to flip all users to dark unless they explicitly pick light again.
const KEY = 'wc26-theme-v2'

/** Dark is the default; light only if the user explicitly chose it. */
export function getTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

/** Apply the theme to <html> + status-bar meta. Persists only when asked. */
export function applyTheme(theme: Theme, persist = false): void {
  const el = document.documentElement
  if (theme === 'light') el.classList.add('light')
  else el.classList.remove('light')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'light' ? '#F4EFE3' : '#0A0A0C')
  if (persist) {
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* ignore storage failures (private mode, etc.) */
    }
  }
}
