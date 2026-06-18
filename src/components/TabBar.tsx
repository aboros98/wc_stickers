import { NavLink } from 'react-router-dom'
import { LayoutGrid, Users } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { useTrades } from '../data/friends'

/** Floating glassmorphism bottom navigation, with an incoming-trade badge. */
export function TabBar() {
  const { user } = useAuth()
  const trades = useTrades()
  const incoming = (trades.data ?? []).filter(
    (t) => t.to_user === user?.id,
  ).length

  const tabs = [
    { to: '/', label: 'Album', Icon: LayoutGrid, end: true, badge: 0 },
    {
      to: '/friends',
      label: 'Prieteni',
      Icon: Users,
      end: false,
      badge: incoming,
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-surface/70 px-2 py-1.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {tabs.map(({ to, label, Icon, end, badge }) => (
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
              <span className="relative">
                <Icon size={18} />
                {badge > 0 && (
                  <span
                    aria-label={`${badge} cereri noi`}
                    className="anim-pop absolute -right-2 -top-2 grid h-4 min-w-[1rem] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface"
                  >
                    {badge}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
