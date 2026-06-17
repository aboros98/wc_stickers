import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { getTheme, applyTheme, type Theme } from '../lib/theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getTheme())
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-fg"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
