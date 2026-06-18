import { NavLink } from 'react-router-dom'
import { LayoutGrid, Users } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Album', Icon: LayoutGrid, end: true },
  { to: '/friends', label: 'Prieteni', Icon: Users, end: false },
]

/** Floating glassmorphism bottom navigation. */
export function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-surface/70 px-2 py-1.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {tabs.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex h-11 w-28 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-turquoise/15 text-turquoise-text'
                    : 'text-fg-muted'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
