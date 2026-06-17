import { forwardRef } from 'react'
import type { Progress } from '../lib/types'
import { ProgressRing } from './ProgressRing'

interface Props {
  progress: Progress
  username?: string | null
  subtitle?: string
  heading?: string
  lines?: string[]
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[12px] bg-surface px-2 py-3">
      <div className="font-display text-2xl font-extrabold tabnum">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-fg-muted">
        {label}
      </div>
    </div>
  )
}

/** The shareable card snapshotted to PNG. Fixed width for consistent images. */
export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { progress, username, subtitle, heading, lines },
  ref,
) {
  return (
    <div
      ref={ref}
      className="w-[360px] overflow-hidden rounded-[24px] border border-border bg-background p-6 text-fg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold">
            Cupa Mondială 2026
          </p>
          <h3 className="font-display text-2xl font-extrabold leading-tight">
            Album abțibilduri
          </h3>
        </div>
        <ProgressRing value={progress.have} total={progress.total} size={84} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <Stat label="Am" value={progress.have} />
        <Stat label="Lipsă" value={progress.missing} />
        <Stat label="Dubluri" value={progress.duplicates} />
      </div>

      {lines && lines.length > 0 && (
        <div className="mt-5 rounded-[16px] bg-surface p-4">
          {heading && (
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-fg-muted">
              {heading}
            </p>
          )}
          <div className="space-y-1">
            {lines.map((l, i) => (
              <p key={i} className="truncate font-mono text-[12px] text-fg">
                {l}
              </p>
            ))}
          </div>
        </div>
      )}

      {subtitle && (
        <p className="mt-4 text-center text-sm text-fg-muted">{subtitle}</p>
      )}
      <p className="mt-5 text-center text-[11px] text-fg-muted">
        {username ? `@${username} · ` : ''}album abțibilduri
      </p>
    </div>
  )
})
