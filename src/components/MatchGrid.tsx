import { Check } from 'lucide-react'
import { Flag } from './Flag'
import type { CollectionItem } from '../lib/types'

interface Props {
  items: CollectionItem[]
  selected: Set<number>
  onToggle: (id: number) => void
  empty?: string
  tone?: 'turquoise' | 'duplicate'
}

/**
 * Tappable flag + code chips (e.g. 🇲🇽 MEX10). Tapping toggles selection;
 * the parent applies the whole batch with one button.
 */
export function MatchGrid({
  items,
  selected,
  onToggle,
  empty = 'Nimic.',
  tone = 'turquoise',
}: Props) {
  if (!items.length) return <p className="text-sm text-fg-muted">{empty}</p>
  const selCls =
    tone === 'duplicate'
      ? 'bg-duplicate/20 ring-duplicate text-duplicate'
      : 'bg-turquoise/20 ring-turquoise text-turquoise'
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => {
        const on = selected.has(it.id)
        return (
          <button
            key={it.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(it.id)}
            className={`flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 ring-1 transition active:scale-90 ${
              on ? selCls : 'bg-surface-2 text-fg ring-border'
            }`}
          >
            {on ? (
              <Check size={14} className="shrink-0" />
            ) : (
              <Flag code={it.country_code} className="h-3 w-4" />
            )}
            <span className="font-display text-sm font-bold tabnum">
              {it.sticker_code}
            </span>
          </button>
        )
      })}
    </div>
  )
}
