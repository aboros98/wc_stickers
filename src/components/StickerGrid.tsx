import type { CollectionItem } from '../lib/types'
import { StickerCell } from './StickerCell'

interface Props {
  items: CollectionItem[]
  onSetCount: (stickerId: number, count: number) => void
  onLongPress: (item: CollectionItem) => void
}

/** Responsive 4/5/6-column portrait grid for one section's slots. */
export function StickerGrid({ items, onSetCount, onLongPress }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
      {items.map((it) => (
        <StickerCell
          key={it.id}
          item={it}
          wide={it.label === 'Team Photo'}
          onSetCount={(c) => onSetCount(it.id, c)}
          onLongPress={onLongPress}
        />
      ))}
    </div>
  )
}
