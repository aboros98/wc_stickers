import { ChevronDown, Trophy } from 'lucide-react'
import { ProgressBar } from './ProgressBar'
import { Flag } from './Flag'

interface Props {
  name: string
  code: string
  have: number
  total: number
  open: boolean
  onToggle: () => void
}

/** Sticky, tappable team/section header with a real flag and inline progress. */
export function SectionHeader({
  name,
  code,
  have,
  total,
  open,
  onToggle,
}: Props) {
  const complete = total > 0 && have >= total
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${name}, ${have} din ${total} colectate`}
      className={`flex w-full items-center gap-3 rounded-[12px] bg-surface px-3 py-3 text-left ${
        complete ? 'ring-1 ring-gold/60' : ''
      }`}
    >
      <Flag code={code} className="h-5 w-7" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-display text-[15px] font-bold">
            {name}
          </span>
          <span className="shrink-0 text-[11px] font-semibold uppercase text-fg-muted">
            {code}
          </span>
        </div>
        <div className="mt-1.5">
          <ProgressBar value={have} total={total} />
        </div>
      </div>
      <span className="grid w-10 shrink-0 place-items-center tabnum text-sm font-bold">
        {complete ? (
          <Trophy size={16} className="text-gold" />
        ) : (
          `${have}/${total}`
        )}
      </span>
      <ChevronDown
        size={18}
        className={`shrink-0 text-fg-muted transition-transform ${
          open ? 'rotate-180' : ''
        }`}
      />
    </button>
  )
}
