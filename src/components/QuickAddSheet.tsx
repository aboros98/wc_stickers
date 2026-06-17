import { useEffect, useState } from 'react'
import { Delete, Check, Layers } from 'lucide-react'
import { Sheet } from './Sheet'
import { parseRanges } from '../lib/ranges'
import { haptic } from '../lib/haptics'
import type { CountrySection } from '../lib/types'

interface Props {
  open: boolean
  onClose: () => void
  sections: CountrySection[]
  onSetCount: (stickerId: number, count: number) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', ',']

const word = (n: number) => (n === 1 ? 'abțibild' : 'abțibilduri')

/**
 * No-AI fast entry: pick a team, type numbers/ranges on a keypad, then mark them
 * as Have or add a Spare. Clears a whole team — or a pile of dupes — in seconds.
 */
export function QuickAddSheet({ open, onClose, sections, onSetCount }: Props) {
  const teams = sections.filter((s) => s.code !== 'FWC')
  const [code, setCode] = useState(teams[0]?.code ?? '')
  const [input, setInput] = useState('')
  const [last, setLast] = useState<string | null>(null)

  const section = teams.find((s) => s.code === code) ?? teams[0]
  const slots = parseRanges(input, 20)

  useEffect(() => {
    if (!last) return
    const t = window.setTimeout(() => setLast(null), 2500)
    return () => window.clearTimeout(t)
  }, [last])

  const apply = (mode: 'have' | 'spare') => {
    if (!section) return
    let applied = 0
    for (const slot of slots) {
      const item = section.items.find((i) => i.slot_no === slot)
      if (!item) continue
      const next = mode === 'have' ? Math.max(item.count, 1) : item.count + 1
      onSetCount(item.id, next)
      applied++
    }
    if (applied) haptic('success')
    setLast(
      applied
        ? mode === 'have'
          ? `Marcate ${applied} ${word(applied)}`
          : `Dubluri adăugate la ${applied} ${word(applied)}`
        : 'Niciun număr potrivit',
    )
    setInput('')
  }

  return (
    <Sheet open={open} onClose={onClose} title="Adăugare rapidă">
      <p className="mb-3 text-sm text-fg-muted">
        Alege o echipă, scrie numere și intervale (ex.{' '}
        <span className="text-fg">1-18, 20</span>), apoi marchează-le.
      </p>

      <select
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="mb-3 w-full rounded-[12px] border border-border bg-surface-2 px-3 py-3 text-base font-semibold text-fg"
        aria-label="Echipă"
      >
        {teams.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name} · {s.have}/{s.total}
          </option>
        ))}
      </select>

      <div className="mb-3 flex min-h-[52px] items-center justify-between rounded-[12px] bg-surface-2 px-4 py-3">
        <span className="font-display text-lg tabnum">
          {input || <span className="text-fg-muted">—</span>}
        </span>
        <span className="text-xs text-fg-muted tabnum">
          {slots.length} {word(slots.length)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              haptic('selection')
              setInput((v) => v + k)
            }}
            className="rounded-[12px] bg-surface-2 py-3 font-display text-xl font-bold active:scale-95"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            haptic('selection')
            setInput((v) => v.slice(0, -1))
          }}
          className="col-span-3 flex items-center justify-center gap-2 rounded-[12px] bg-surface-2 py-2.5 text-sm font-semibold text-fg-muted active:scale-95"
        >
          <Delete size={16} /> Șterge
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => apply('have')}
          disabled={!slots.length}
          className="flex items-center justify-center gap-2 rounded-[12px] bg-primary py-3.5 font-bold text-black disabled:opacity-40"
        >
          <Check size={18} /> Marchează Am
        </button>
        <button
          type="button"
          onClick={() => apply('spare')}
          disabled={!slots.length}
          className="flex items-center justify-center gap-2 rounded-[12px] bg-duplicate py-3.5 font-bold text-black disabled:opacity-40"
        >
          <Layers size={18} /> Adaugă dublură
        </button>
      </div>

      <p
        className={`mt-3 h-5 text-center text-sm font-semibold transition-opacity ${
          last ? 'text-primary opacity-100' : 'opacity-0'
        }`}
        aria-live="polite"
      >
        {last}
      </p>
    </Sheet>
  )
}
