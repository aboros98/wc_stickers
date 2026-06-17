import type { ReactNode } from 'react'

interface Props {
  title: string
  icon?: ReactNode
  children?: ReactNode
}

export function EmptyState({ title, icon, children }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      {icon && <div className="text-fg-muted">{icon}</div>}
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {children && <p className="max-w-xs text-sm text-fg-muted">{children}</p>}
    </div>
  )
}
