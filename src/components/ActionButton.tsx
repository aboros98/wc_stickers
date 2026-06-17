import type { ReactNode } from 'react'

interface Props {
  onClick: () => void
  icon: ReactNode
  children: ReactNode
  disabled?: boolean
  tone?: 'default' | 'primary'
}

/** Compact icon-over-label action button used in screen action rows. */
export function ActionButton({
  onClick,
  icon,
  children,
  disabled,
  tone = 'default',
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1 rounded-[12px] py-3 text-xs font-semibold disabled:opacity-50 active:scale-95 ${
        tone === 'primary' ? 'bg-gold text-black' : 'bg-surface-2 text-fg'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
