import type { ReactNode } from 'react'

interface Props {
  active: boolean
  onClick: () => void
  children: ReactNode
  count?: number
}

export function FilterChip({ active, onClick, children, count }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
        active ? 'bg-primary text-black' : 'bg-surface-2 text-fg-muted'
      }`}
    >
      {children}
      {typeof count === 'number' && (
        <span className="tabnum text-[11px] opacity-80">{count}</span>
      )}
    </button>
  )
}
