import { Flag } from './Flag'
import type { CollectionItem } from '../lib/types'

interface Props {
  items: CollectionItem[]
  onApply: (it: CollectionItem) => void
  empty?: string
}

/** Tappable flag + code cards (e.g. 🇲🇽 MEX10). Tap applies the swap. */
export function MatchGrid({ items, onApply, empty = 'Nimic.' }: Props) {
  if (!items.length) return <p className="text-sm text-fg-muted">{empty}</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onApply(it)}
          className="flex items-center gap-1.5 rounded-[10px] bg-surface-2 px-2.5 py-1.5 ring-1 ring-border transition active:scale-90"
        >
          <Flag code={it.country_code} className="h-3 w-4" />
          <span className="font-display text-sm font-bold tabnum">
            {it.sticker_code}
          </span>
        </button>
      ))}
    </div>
  )
}
