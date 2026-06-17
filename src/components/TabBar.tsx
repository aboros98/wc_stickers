import { NavLink } from 'react-router-dom'
import { LayoutGrid, CircleSlash2, Layers, ArrowLeftRight, Share2 } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Album', Icon: LayoutGrid, end: true },
  { to: '/missing', label: 'Lipsă', Icon: CircleSlash2, end: false },
  { to: '/spares', label: 'Dubluri', Icon: Layers, end: false },
  { to: '/swap', label: 'Schimb', Icon: ArrowLeftRight, end: false },
  { to: '/share', label: 'Distribuie', Icon: Share2, end: false },
]

/** Persistent thumb-reachable bottom navigation. */
export function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-2xl">
        {tabs.map(({ to, label, Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
                  isActive ? 'text-primary' : 'text-fg-muted'
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
