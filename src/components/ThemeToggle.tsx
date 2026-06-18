import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { getTheme, applyTheme, type Theme } from '../lib/theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getTheme())
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next, true)
    setTheme(next)
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Comută pe tema deschisă' : 'Comută pe tema închisă'}
      className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 text-fg active:scale-90"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
