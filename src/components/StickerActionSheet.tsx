import { Minus, Plus } from 'lucide-react'
import { Sheet } from './Sheet'
import { Flag } from './Flag'
import type { CollectionItem } from '../lib/types'
import { statusOf } from '../lib/types'
import { haptic } from '../lib/haptics'

interface Props {
  item: CollectionItem | null
  onClose: () => void
  onSetCount: (stickerId: number, count: number) => void
}

/** Editor for one sticker: state (sliding segmented control) + spare quantity. */
export function StickerActionSheet({ item, onClose, onSetCount }: Props) {
  const count = item?.count ?? 0
  const status = item ? statusOf(item.count) : 'missing'
  const spare = count > 1 ? count - 1 : 0
  const idx = status === 'missing' ? 0 : status === 'have' ? 1 : 2

  const sub = !item
    ? ''
    : item.country_code === 'FWC'
      ? (item.label ?? '')
      : item.slot_no === 1
        ? 'Emblemă'
        : item.label === 'Team Photo'
          ? 'Foto echipă'
          : (item.country ?? '')

  const set = (c: number) => {
    if (!item) return
    haptic('selection')
    onSetCount(item.id, Math.max(0, c))
  }

  return (
    <Sheet open={!!item} onClose={onClose}>
      {item && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <Flag
              code={item.country_code}
              className="h-7 w-10 rounded-[3px] ring-1 ring-black/15"
            />
            <div className="min-w-0">
              <div className="font-display text-lg font-bold leading-tight">
                {item.sticker_code}
              </div>
              <div className="truncate text-xs text-fg-muted">{sub}</div>
            </div>
          </div>

          <div className="relative mb-4 grid grid-cols-3 rounded-[12px] bg-surface-2 p-1 text-sm font-bold">
            <span
              aria-hidden="true"
              className="absolute inset-y-1 left-1 rounded-[9px] bg-primary transition-transform duration-200 ease-out"
              style={{
                width: 'calc((100% - 0.5rem) / 3)',
                transform: `translateX(${idx * 100}%)`,
              }}
            />
            <button
              type="button"
              onClick={() => set(0)}
              className={`relative z-10 py-2.5 transition-colors ${idx === 0 ? 'text-black' : 'text-fg-muted'}`}
            >
              Lipsă
            </button>
            <button
              type="button"
              onClick={() => set(1)}
              className={`relative z-10 py-2.5 transition-colors ${idx === 1 ? 'text-black' : 'text-fg-muted'}`}
            >
              Am
            </button>
            <button
              type="button"
              onClick={() => set(Math.max(2, count))}
              className={`relative z-10 py-2.5 transition-colors ${idx === 2 ? 'text-black' : 'text-fg-muted'}`}
            >
              Dublură
            </button>
          </div>

          <div className="flex items-center justify-between rounded-[12px] bg-surface-2 p-3">
            <span className="text-sm font-semibold">Dubluri</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="O dublură mai puțin"
                onClick={() => set(count - 1)}
                disabled={count <= 1}
                className="grid h-9 w-9 place-items-center rounded-full bg-surface transition active:scale-90 disabled:opacity-40"
              >
                <Minus size={16} />
              </button>
              <span
                key={spare}
                className="w-6 text-center tabnum text-lg font-bold"
                style={{ animation: 'pop 160ms ease-out' }}
              >
                {spare}
              </span>
              <button
                type="button"
                aria-label="O dublură în plus"
                onClick={() => set(count < 1 ? 2 : count + 1)}
                className="grid h-9 w-9 place-items-center rounded-full bg-primary text-black transition active:scale-90"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </Sheet>
  )
}
