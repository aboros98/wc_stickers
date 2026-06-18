import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { LEGAL_UPDATED } from '../lib/legal'

/** Standalone, public layout for the privacy / terms pages (no tab bar). */
export function LegalLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="anim-fade-up mx-auto min-h-dvh max-w-2xl px-5 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/"
          aria-label="Înapoi"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-fg-muted active:scale-95"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-2xl font-extrabold">{title}</h1>
      </div>
      <p className="mb-6 text-xs text-fg-muted">
        Ultima actualizare: {LEGAL_UPDATED}
      </p>
      <div className="space-y-5 text-sm leading-relaxed text-fg-muted [&_a]:text-turquoise [&_a]:underline [&_h2]:mb-1.5 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-fg [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  )
}
