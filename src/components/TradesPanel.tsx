import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { TradeRow } from '../data/friends'

interface Props {
  trades: TradeRow[]
  meId: string
  nameOf: (id: string) => string
  codeOf: (id: number) => string
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  busyId: string | null
}

function Row({
  Icon,
  label,
  ids,
  codeOf,
  tone,
  chip,
}: {
  Icon: LucideIcon
  label: string
  ids: number[]
  codeOf: (id: number) => string
  tone: string
  chip: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className={`mt-0.5 shrink-0 ${tone}`} />
      <span className="w-14 shrink-0 text-xs font-semibold text-fg-muted">
        {label}
      </span>
      {ids.length ? (
        <div className="flex flex-wrap gap-1">
          {ids.map((id) => (
            <span
              key={id}
              className={`rounded-[7px] px-1.5 py-0.5 text-[11px] font-bold tabnum ${chip}`}
            >
              {codeOf(id)}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-xs text-fg-muted">—</span>
      )}
    </div>
  )
}

export function TradesPanel({
  trades,
  meId,
  nameOf,
  codeOf,
  onAccept,
  onDecline,
  busyId,
}: Props) {
  return (
    <div className="mb-4 overflow-hidden rounded-[16px] border border-turquoise/40 bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-turquoise/15 text-turquoise-text">
          <ArrowLeftRight size={16} />
        </div>
        <h2 className="font-display text-base font-bold">
          Schimburi în așteptare
        </h2>
        <span className="ml-auto grid h-6 min-w-[1.5rem] place-items-center rounded-full bg-turquoise/15 px-1.5 text-xs font-bold text-turquoise-text">
          {trades.length}
        </span>
      </div>
      <div className="divide-y divide-border">
        {trades.map((t) => {
          const incoming = t.to_user === meId
          const other = incoming ? t.from_user : t.to_user
          const myGet = incoming ? t.give_ids : t.take_ids
          const myGive = incoming ? t.take_ids : t.give_ids
          const busy = busyId === t.id
          return (
            <div key={t.id} className="px-4 py-3">
              <p className="mb-2 text-sm">
                {incoming ? (
                  <>
                    <span className="font-bold text-turquoise-text">
                      {nameOf(other)}
                    </span>{' '}
                    îți propune un schimb
                  </>
                ) : (
                  <>
                    Aștepți răspuns de la{' '}
                    <span className="font-bold">{nameOf(other)}</span>
                  </>
                )}
              </p>
              <div className="space-y-1.5">
                <Row
                  Icon={ArrowDownLeft}
                  label="Primești"
                  ids={myGet}
                  codeOf={codeOf}
                  tone="text-turquoise-text"
                  chip="bg-turquoise/15 text-turquoise-text"
                />
                <Row
                  Icon={ArrowUpRight}
                  label="Dai"
                  ids={myGive}
                  codeOf={codeOf}
                  tone="text-duplicate"
                  chip="bg-duplicate/15 text-duplicate"
                />
              </div>
              <div className="mt-2.5 flex gap-2">
                {incoming ? (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDecline(t.id)}
                      className="flex-1 rounded-[10px] bg-surface-2 py-2 text-sm font-bold active:scale-[0.98] disabled:opacity-50"
                    >
                      Refuză
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onAccept(t.id)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-[10px] bg-primary py-2 text-sm font-bold text-black active:scale-[0.98] disabled:opacity-50"
                    >
                      <Check size={15} /> Acceptă
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onDecline(t.id)}
                    className="flex w-full items-center justify-center gap-1 rounded-[10px] bg-surface-2 py-2 text-sm font-semibold active:scale-[0.98] disabled:opacity-50"
                  >
                    <X size={14} /> Anulează propunerea
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
