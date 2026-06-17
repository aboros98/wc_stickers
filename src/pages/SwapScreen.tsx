import { useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Share2,
  ScanLine,
  Check,
  Undo2,
  Link as LinkIcon,
} from 'lucide-react'
import { useCollection, useSetCount } from '../data/useCollection'
import { encodeCollection, decodeStates, computeMatch } from '../lib/swap'
import { copyText, shareText } from '../lib/share'
import { haptic } from '../lib/haptics'
import { ActionButton } from '../components/ActionButton'
import { TileSkeleton } from '../components/TileSkeleton'
import { QrScannerSheet } from '../components/QrScannerSheet'
import { Flag } from '../components/Flag'
import type { CollectionItem } from '../lib/types'

function extractPayload(s: string): string | null {
  const t = s.trim()
  if (!t) return null
  const m = t.match(/s=([A-Za-z0-9\-_]+)/)
  if (m) return m[1]
  if (/^[A-Za-z0-9\-_]+$/.test(t)) return t
  return null
}

function groupByCountry(items: CollectionItem[]): [string, CollectionItem[]][] {
  const map = new Map<string, CollectionItem[]>()
  for (const it of items) {
    const arr = map.get(it.country_code)
    if (arr) arr.push(it)
    else map.set(it.country_code, [it])
  }
  return [...map.entries()]
}

function SwapList({ items }: { items: CollectionItem[] }) {
  return (
    <div className="space-y-3">
      {groupByCountry(items).map(([code, list]) => (
        <div key={code}>
          <div className="mb-1.5 flex items-center gap-2">
            <Flag code={code} className="h-3 w-4" />
            <span className="font-display text-sm font-bold">
              {list[0].country ?? code}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {list.map((it) => (
              <span
                key={it.id}
                className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold tabnum"
              >
                {it.country_code === 'FWC' ? it.sticker_code : it.slot_no}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface Applied {
  got: number
  gave: number
  undo: { id: number; prev: number }[]
}

export function SwapScreen() {
  const { items, isLoading } = useCollection()
  const setCount = useSetCount()
  const { hash } = useLocation()
  const [pasted, setPasted] = useState('')
  const [scanOpen, setScanOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [applied, setApplied] = useState<Applied | null>(null)

  const myLink = useMemo(() => {
    if (!items.length) return ''
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}${import.meta.env.BASE_URL}swap#s=${encodeCollection(items)}`
  }, [items])

  const incoming = extractPayload(hash) ?? extractPayload(pasted)
  const theirStates = incoming ? decodeStates(incoming) : null
  const match = theirStates && items.length ? computeMatch(items, theirStates) : null

  const applyTrade = () => {
    if (!match) return
    const undo = [
      ...match.get.map((it) => ({ id: it.id, prev: it.count })),
      ...match.give.map((it) => ({ id: it.id, prev: it.count })),
    ]
    const got = match.get.length
    const gave = match.give.length
    for (const it of match.get)
      setCount.mutate({ stickerId: it.id, count: Math.max(it.count, 1) })
    for (const it of match.give)
      setCount.mutate({ stickerId: it.id, count: Math.max(0, it.count - 1) })
    haptic('success')
    setConfirming(false)
    setApplied({ got, gave, undo })
  }

  const undoTrade = () => {
    if (!applied) return
    for (const u of applied.undo)
      setCount.mutate({ stickerId: u.id, count: u.prev })
    haptic('selection')
    setApplied(null)
  }

  if (isLoading) {
    return (
      <div className="px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <TileSkeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="anim-fade-up px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <h1 className="mb-1 font-display text-2xl font-extrabold">Schimb</h1>
      <p className="mb-5 text-sm text-fg-muted">
        Compară dublurile tale cu lista de lipsuri a unui prieten — și invers.
      </p>

      {applied ? (
        <div className="mb-6 rounded-[16px] border border-primary/40 bg-surface p-5 text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-primary text-black">
            <Check size={20} strokeWidth={3} />
          </div>
          <h2 className="font-display text-lg font-bold">Schimb înregistrat</h2>
          <p className="mt-1 text-sm text-fg-muted">
            <span className="tabnum">{applied.got}</span> colectate ·{' '}
            <span className="tabnum">{applied.gave}</span> dubluri folosite
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={undoTrade}
              className="flex items-center justify-center gap-2 rounded-[12px] bg-surface-2 py-3 font-semibold text-fg"
            >
              <Undo2 size={16} /> Anulează
            </button>
            <Link
              to="/swap"
              onClick={() => {
                setApplied(null)
                setPasted('')
              }}
              className="flex items-center justify-center rounded-[12px] bg-primary py-3 font-bold text-black"
            >
              Gata
            </Link>
          </div>
        </div>
      ) : (
        match && (
          <div className="mb-6 space-y-5 rounded-[16px] border border-border bg-surface p-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary">
                <ArrowDownLeft size={18} />
                <h2 className="font-display text-base font-bold">
                  Primești <span className="tabnum">{match.get.length}</span>
                </h2>
              </div>
              {match.get.length ? (
                <SwapList items={match.get} />
              ) : (
                <p className="text-sm text-fg-muted">
                  Nu au nicio dublură de care ai nevoie.
                </p>
              )}
            </div>
            <div className="h-px bg-border" />
            <div>
              <div className="mb-2 flex items-center gap-2 text-duplicate">
                <ArrowUpRight size={18} />
                <h2 className="font-display text-base font-bold">
                  Dai <span className="tabnum">{match.give.length}</span>
                </h2>
              </div>
              {match.give.length ? (
                <SwapList items={match.give} />
              ) : (
                <p className="text-sm text-fg-muted">
                  Niciuna dintre dublurile tale nu se potrivește cu lipsurile lor.
                </p>
              )}
            </div>

            {(match.get.length > 0 || match.give.length > 0) && (
              <div className="space-y-2">
                <p className="text-center text-xs text-fg-muted">
                  Marchează {match.get.length} ca fiind colectate și folosește{' '}
                  {match.give.length} dubluri.
                </p>
                <button
                  type="button"
                  onClick={() => (confirming ? applyTrade() : setConfirming(true))}
                  className={`flex w-full items-center justify-center gap-2 rounded-[12px] py-3 font-bold ${
                    confirming ? 'bg-primary text-black' : 'bg-surface-2 text-fg'
                  }`}
                >
                  <Check size={18} />
                  {confirming
                    ? 'Atinge din nou pentru confirmare'
                    : 'Marchează ca schimbate'}
                </button>
              </div>
            )}

            <Link
              to="/swap"
              onClick={() => {
                setPasted('')
                setConfirming(false)
              }}
              className="block text-center text-sm text-fg-muted underline"
            >
              Șterge
            </Link>
          </div>
        )
      )}

      <div className="mb-6 rounded-[16px] border border-border bg-surface p-4 text-center">
        <h2 className="mb-3 font-display text-base font-bold">Codul tău de schimb</h2>
        <div className="mx-auto inline-block rounded-[12px] bg-white p-3">
          {myLink && (
            <QRCodeSVG
              value={myLink}
              size={180}
              bgColor="#ffffff"
              fgColor="#0A0A0C"
            />
          )}
        </div>
        <p className="mt-3 text-xs text-fg-muted">
          Un prieten scanează asta ca să vadă ce poți schimba.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <ActionButton
            icon={<Copy size={16} />}
            onClick={async () => {
              if (await copyText(myLink)) haptic('success')
            }}
          >
            Copiază linkul
          </ActionButton>
          <ActionButton
            icon={<Share2 size={16} />}
            onClick={() =>
              shareText(myLink, 'Codul meu de schimb Panini Cupa Mondială 2026')
            }
          >
            Distribuie linkul
          </ActionButton>
        </div>
      </div>

      <div className="rounded-[16px] border border-border bg-surface p-4">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
          <LinkIcon size={16} /> Ai codul unui prieten?
        </h2>
        <button
          type="button"
          onClick={() => setScanOpen(true)}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-[12px] bg-primary py-3 font-bold text-black active:scale-95"
        >
          <ScanLine size={18} /> Scanează QR-ul lor
        </button>
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder="…sau lipește aici linkul lor de schimb"
          rows={2}
          className="w-full resize-none rounded-[12px] border border-border bg-surface-2 p-3 text-base outline-none focus:border-primary"
        />
        {pasted && !theirStates && (
          <p className="mt-2 text-xs text-danger">
            Acesta nu pare un link de schimb valid.
          </p>
        )}
      </div>

      <QrScannerSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onResult={(text) => {
          setPasted(text)
          setScanOpen(false)
        }}
      />
    </div>
  )
}
