import { Minus, Plus, RotateCcw } from 'lucide-react'
import { Sheet } from './Sheet'
import { Flag } from './Flag'
import type { CollectionItem } from '../lib/types'
import { statusOf } from '../lib/types'
import { haptic } from '../lib/haptics'
import type { ReactNode } from 'react'

interface Props {
  item: CollectionItem | null
  onClose: () => void
  onSetCount: (stickerId: number, count: number) => void
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[12px] py-2.5 text-sm font-bold transition-colors ${
        active ? 'bg-primary text-black' : 'bg-surface-2 text-fg-muted'
      }`}
    >
      {children}
    </button>
  )
}

/** Editor for one sticker: state + spare quantity, with flag + context. */
export function StickerActionSheet({ item, onClose, onSetCount }: Props) {
  const count = item?.count ?? 0
  const status = item ? statusOf(item.count) : 'missing'
  const spare = count > 1 ? count - 1 : 0

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

          <div className="mb-4 grid grid-cols-3 gap-2">
            <SegBtn active={status === 'missing'} onClick={() => set(0)}>
              Lipsă
            </SegBtn>
            <SegBtn active={status === 'have'} onClick={() => set(1)}>
              Am
            </SegBtn>
            <SegBtn
              active={status === 'duplicate'}
              onClick={() => set(Math.max(2, count))}
            >
              Dublură
            </SegBtn>
          </div>

          <div className="flex items-center justify-between rounded-[12px] bg-surface-2 p-3">
            <span className="text-sm font-semibold">Dubluri</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="O dublură mai puțin"
                onClick={() => set(count - 1)}
                disabled={count <= 1}
                className="grid h-9 w-9 place-items-center rounded-full bg-surface disabled:opacity-40"
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center tabnum text-lg font-bold">
                {spare}
              </span>
              <button
                type="button"
                aria-label="O dublură în plus"
                onClick={() => set(count < 1 ? 2 : count + 1)}
                className="grid h-9 w-9 place-items-center rounded-full bg-primary text-black"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => set(0)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] py-3 text-sm font-semibold text-danger"
          >
            <RotateCcw size={16} /> Resetează
          </button>
        </>
      )}
    </Sheet>
  )
}
