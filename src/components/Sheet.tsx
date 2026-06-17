import { useEffect, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/** Minimal accessible bottom sheet (backdrop + slide-up). */
export function Sheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-2xl rounded-t-[24px] border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl"
        style={{ animation: 'sheet-up 220ms ease-out' }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        {title && <h2 className="mb-3 font-display text-lg font-bold">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
