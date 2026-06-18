import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, ChevronDown, History } from 'lucide-react'
import type { TradeRow } from '../data/friends'

interface Props {
  trades: TradeRow[]
  meId: string
  nameOf: (id: string) => string
  codeOf: (id: number) => string
}

function ago(iso?: string | null): string {
  if (!iso) return ''
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'acum'
  if (min < 60) return `${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} h`
  const d = Math.round(h / 24)
  if (d < 30) return `${d} z`
  return new Date(iso).toLocaleDateString('ro-RO')
}

/** Read-only log of resolved trades (both directions), from the viewer's perspective. */
export function TradeHistoryPanel({ trades, meId, nameOf, codeOf }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-4 overflow-hidden rounded-[16px] border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-fg-muted">
          <History size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-bold">
            Schimburi finalizate
          </div>
          <div className="text-xs text-fg-muted">{trades.length} în total</div>
        </div>
        <ChevronDown
          size={20}
          className={`shrink-0 text-fg-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="max-h-72 divide-y divide-border overflow-auto border-t border-border">
          {trades.map((t) => {
            const incoming = t.to_user === meId
            const other = incoming ? t.from_user : t.to_user
            const myGet = incoming ? t.give_ids : t.take_ids
            const myGive = incoming ? t.take_ids : t.give_ids
            const done = t.status === 'accepted'
            return (
              <div key={t.id} className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {nameOf(other)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      done
                        ? 'bg-primary/15 text-primary-text'
                        : 'bg-surface-2 text-fg-muted'
                    }`}
                  >
                    {done ? 'Finalizat' : 'Refuzat'}
                  </span>
                  <span className="shrink-0 text-[11px] tabnum text-fg-muted">
                    {ago(t.resolved_at)}
                  </span>
                </div>
                {done && (myGet.length > 0 || myGive.length > 0) && (
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] tabnum">
                    {myGet.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-turquoise-text">
                        <ArrowDownLeft size={11} className="shrink-0" />
                        {myGet.map(codeOf).join(', ')}
                      </span>
                    )}
                    {myGive.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-duplicate">
                        <ArrowUpRight size={11} className="shrink-0" />
                        {myGive.map(codeOf).join(', ')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
