import { NavLink } from 'react-router-dom'
import { LayoutGrid, CircleSlash2, Layers, ArrowLeftRight, Users } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Album', Icon: LayoutGrid, end: true },
  { to: '/missing', label: 'Lipsă', Icon: CircleSlash2, end: false },
  { to: '/spares', label: 'Dubluri', Icon: Layers, end: false },
  { to: '/swap', label: 'Schimb', Icon: ArrowLeftRight, end: false },
  { to: '/friends', label: 'Prieteni', Icon: Users, end: false },
]

/** Floating glassmorphism bottom navigation. */
export function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <ul className="flex w-full max-w-md items-center justify-around rounded-full border border-white/10 bg-surface/70 px-1.5 py-1.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {tabs.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex h-12 w-[58px] flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                  isActive ? 'bg-turquoise/15 text-turquoise' : 'text-fg-muted'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
