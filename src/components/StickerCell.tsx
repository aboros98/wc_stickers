import { useRef, type PointerEvent as RPointerEvent } from 'react'
import { Check } from 'lucide-react'
import type { CollectionItem } from '../lib/types'
import { statusOf } from '../lib/types'
import { haptic } from '../lib/haptics'

interface Props {
  item: CollectionItem
  wide?: boolean
  onSetCount: (count: number) => void
  onLongPress: (item: CollectionItem) => void
}

const LONG_PRESS_MS = 400
const MOVE_CANCEL_SQ = 100 // (10px)^2 — a scroll past this cancels the long-press

/**
 * One album slot. Tap cycles Missing → Have → +duplicate; long-press (or
 * right-click) opens the action sheet. The long-press cancels as soon as the
 * finger moves, so scrolling over slots never opens the editor by accident.
 * State is shown by colour AND icon AND label for colourblind / SR users.
 */
export function StickerCell({ item, wide, onSetCount, onLongPress }: Props) {
  const status = statusOf(item.count)
  const isFoil = item.type === 'foil' || item.type === 'special'
  const spare = item.count > 1 ? item.count - 1 : 0
  const longPressed = useRef(false)
  const timer = useRef<number | null>(null)
  const startPos = useRef<{ x: number; y: number } | null>(null)

  const start = (e: RPointerEvent) => {
    longPressed.current = false
    startPos.current = { x: e.clientX, y: e.clientY }
    timer.current = window.setTimeout(() => {
      longPressed.current = true
      haptic('selection')
      onLongPress(item)
    }, LONG_PRESS_MS)
  }
  const move = (e: RPointerEvent) => {
    if (timer.current === null || !startPos.current) return
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    if (dx * dx + dy * dy > MOVE_CANCEL_SQ) clear()
  }
  const clear = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }
  const handleClick = () => {
    if (longPressed.current) {
      longPressed.current = false
      return
    }
    haptic('selection')
    onSetCount(item.count === 0 ? 1 : item.count + 1)
  }
  const openSheet = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    onLongPress(item)
  }

  const shape = wide ? 'col-span-2 aspect-[3/2]' : 'aspect-[3/4]'
  const base = `relative select-none rounded-[12px] border text-left transition-transform active:scale-95 ${shape}`
  const label = item.country ?? item.country_code

  const handlers = {
    onClick: handleClick,
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: clear,
    onPointerLeave: clear,
    onContextMenu: openSheet,
  }

  if (status === 'missing') {
    return (
      <button
        type="button"
        aria-label={`${label}, abțibild ${item.sticker_code}, lipsă — atinge ca să-l colectezi`}
        className={`${base} border-2 border-dashed border-missing/50 bg-surface-2`}
        {...handlers}
      >
        <span className="absolute bottom-1 left-1.5 font-display text-[11px] font-bold uppercase tracking-wide text-fg-muted/60 tabnum">
          {item.sticker_code}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-label={`${label}, abțibild ${item.sticker_code}, colectat${spare ? `, ${spare} dublură` : ''} — atinge pentru o dublură, ține apăsat ca să editezi`}
      className={`${base} sticker-flip border-transparent shadow-lg ${isFoil ? 'foil-sheen' : ''}`}
      style={
        isFoil
          ? {
              background:
                'linear-gradient(135deg, var(--color-foil-from), var(--color-foil-via), var(--color-foil-to))',
            }
          : {
              background:
                'linear-gradient(150deg, var(--color-sky), var(--color-primary))',
            }
      }
      {...handlers}
    >
      <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-white/90 text-primary-strong">
        <Check size={12} strokeWidth={3} />
      </span>
      {spare > 0 && (
        <span
          className="absolute bottom-1 right-1 rounded-full bg-duplicate px-1.5 py-0.5 text-[10px] font-bold text-black tabnum"
          style={{ animation: 'pop 160ms ease-out' }}
        >
          +{spare}
        </span>
      )}
      <span
        className={`absolute bottom-1 left-1.5 font-display text-[11px] font-bold uppercase tracking-wide tabnum ${
          isFoil ? 'text-black/70' : 'text-white/90'
        }`}
      >
        {item.sticker_code}
      </span>
    </button>
  )
}
