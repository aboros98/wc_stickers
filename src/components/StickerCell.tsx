import { memo, useRef, type PointerEvent as RPointerEvent } from 'react'
import { Check, Plus } from 'lucide-react'
import { Flag } from './Flag'
import { teamAccent } from '../lib/teamColors'
import type { CollectionItem } from '../lib/types'
import { statusOf } from '../lib/types'
import { haptic } from '../lib/haptics'

interface Props {
  item: CollectionItem
  onSetCount: (stickerId: number, count: number) => void
  onLongPress: (item: CollectionItem) => void
}

const LONG_PRESS_MS = 400
const MOVE_CANCEL_SQ = 100 // (10px)^2 — a scroll past this cancels the long-press

/**
 * One album slot: big number in the team's national colour, with the "26"
 * motif. Slot 1 shows the country emblem (flag). Player names per number aren't
 * reliable from public data, so we keep the (authoritative) number and only
 * caption the stickers we can trust (emblem / team photo / FWC specials).
 */
function StickerCellBase({ item, onSetCount, onLongPress }: Props) {
  const status = statusOf(item.count)
  const isFoil = item.type === 'foil' || item.type === 'special'
  const spare = item.count > 1 ? item.count - 1 : 0
  const longPressed = useRef(false)
  const timer = useRef<number | null>(null)
  const startPos = useRef<{ x: number; y: number } | null>(null)

  const isBadge = item.country_code !== 'FWC' && item.slot_no === 1
  const accent = teamAccent(item.country_code)
  const teamBg = `linear-gradient(160deg, color-mix(in srgb, ${accent} 46%, #0A0A0C), color-mix(in srgb, ${accent} 15%, #0A0A0C))`
  const big =
    item.country_code === 'FWC'
      ? item.sticker_code.replace(/^FWC/, '') || item.sticker_code
      : item.slot_no
  const caption = isBadge
    ? 'Emblemă'
    : item.country_code === 'FWC'
      ? (item.label ?? '')
      : item.label === 'Team Photo'
        ? 'Foto echipă'
        : ''
  const label = item.country ?? item.country_code

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
    if (item.count === 0) {
      haptic('selection')
      onSetCount(item.id, 1) // tap empty → collected
    } else {
      onLongPress(item) // tap owned → open editor (add spares / reset)
    }
  }
  const openSheet = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    onLongPress(item)
  }

  const handlers = {
    onClick: handleClick,
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: clear,
    onPointerLeave: clear,
    onContextMenu: openSheet,
  }

  // Slot 13 is the landscape team photo in the real album — span 2 slots, wide.
  const isLandscape = item.country_code !== 'FWC' && item.slot_no === 13
  const shape = isLandscape ? 'col-span-2 aspect-[16/9]' : 'aspect-[3/4]'
  const base =
    'relative flex select-none flex-col items-center justify-center overflow-hidden rounded-[12px] border px-1 text-center transition-transform active:scale-95'

  if (status === 'missing') {
    return (
      <button
        type="button"
        aria-label={`${label}, ${item.sticker_code}, lipsă — atinge ca să-l colectezi`}
        className={`${base} ${shape} border-2 border-dashed border-missing/40 bg-surface-2`}
        {...handlers}
      >
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 text-fg-muted/35"
        >
          <Plus size={10} strokeWidth={3} />
        </span>
        {isBadge ? (
          <Flag code={item.country_code} className="h-8 w-12 opacity-45 grayscale" />
        ) : (
          <span className="font-display text-[26px] font-black leading-none tabnum text-fg-muted">
            {big}
          </span>
        )}
        {caption && (
          <span className="mt-1 line-clamp-2 text-[9px] font-medium leading-tight text-fg-muted">
            {caption}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-label={`${label}, ${item.sticker_code}, colectat${spare ? `, ${spare} dublură` : ''} — atinge ca să editezi`}
      className={`${base} ${shape} sticker-flip border-transparent shadow-md ${isFoil ? 'foil-sheen' : ''}`}
      style={
        isFoil
          ? {
              background:
                'linear-gradient(135deg, var(--color-foil-from), var(--color-foil-via), var(--color-foil-to))',
            }
          : { background: teamBg }
      }
      {...handlers}
    >
      <span
        className={`pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[58px] font-black leading-none ${isFoil ? 'text-black/[0.06]' : 'text-white/[0.04]'}`}
        aria-hidden="true"
      >
        26
      </span>
      <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-white/90 text-primary-strong">
        <Check size={11} strokeWidth={3} />
      </span>
      {spare > 0 && (
        <span className="anim-pop absolute bottom-1 right-1 rounded-full bg-duplicate px-1.5 py-0.5 text-[10px] font-bold text-white tabnum">
          +{spare}
        </span>
      )}
      {isBadge ? (
        <Flag
          code={item.country_code}
          className="relative h-8 w-12 rounded-[3px] shadow ring-1 ring-black/25"
        />
      ) : (
        <span
          className={`relative font-display text-[28px] font-black leading-none tabnum ${isFoil ? 'text-black/90' : 'text-white'}`}
          style={isFoil ? undefined : { textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
        >
          {big}
        </span>
      )}
      {caption && (
        <span
          className={`relative mt-1 line-clamp-2 px-0.5 text-[9px] font-semibold leading-tight ${isFoil ? 'text-black/70' : 'text-white/90'}`}
        >
          {caption}
        </span>
      )}
    </button>
  )
}

export const StickerCell = memo(StickerCellBase)
