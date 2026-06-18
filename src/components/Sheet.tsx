import { useEffect, useId, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  /** Accessible name when there's no visible `title` (e.g. sheets with a custom header). */
  label?: string
  children: ReactNode
}

/** Accessible bottom sheet: scroll-locked, focus-trapped, Escape/backdrop to close. */
export function Sheet({ open, onClose, title, label, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden' // lock background scroll
    const prevFocus = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    panel?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && panel) {
        const f = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
        )
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title ? undefined : (label ?? 'Fereastră')}
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="anim-sheet-up relative z-10 max-h-[88dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-[24px] border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl outline-none"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        {title && (
          <h2 id={titleId} className="mb-3 font-display text-lg font-bold">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
