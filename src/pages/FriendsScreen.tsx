import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  UserPlus,
  Users,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { useCollection, useBulkSetCount } from '../data/useCollection'
import {
  useFriendStickers,
  useFriends,
  useAddFriend,
  removeFriendship,
  type FriendProfile,
} from '../data/friends'
import { hideFriend } from '../lib/friends'
import { haptic } from '../lib/haptics'
import { Flag } from '../components/Flag'
import { Snackbar } from '../components/Snackbar'
import { EmptyState } from '../components/EmptyState'
import { TileSkeleton } from '../components/TileSkeleton'
import wc26 from '../assets/wc2026.webp'
import type { CollectionItem } from '../lib/types'

/** The number shown on a chip — slot number for teams, the FWC index for specials. */
const numOf = (it: CollectionItem) =>
  it.country_code === 'FWC'
    ? it.sticker_code.replace(/^FWC/, '') || it.sticker_code
    : it.slot_no

interface CountryGroup {
  code: string
  name: string
  items: CollectionItem[]
}

/** Group items into contiguous country blocks (catalog order is already grouped). */
function groupByCountry(items: CollectionItem[]): CountryGroup[] {
  const out: CountryGroup[] = []
  const idx = new Map<string, number>()
  for (const it of items) {
    let i = idx.get(it.country_code)
    if (i === undefined) {
      i = out.length
      idx.set(it.country_code, i)
      out.push({
        code: it.country_code,
        name:
          it.country ?? (it.country_code === 'FWC' ? 'Speciale' : it.country_code),
        items: [],
      })
    }
    out[i].items.push(it)
  }
  return out
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  if (src)
    return (
      <img
        src={src}
        alt=""
        className="h-11 w-11 rounded-full object-cover ring-1 ring-border"
      />
    )
  return (
    <div className="grid h-11 w-11 place-items-center rounded-full bg-turquoise/20 font-display text-lg font-bold text-turquoise">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

/** One direction of a swap (Iei / Dai): country headers + selectable number chips. */
function SwapSection({
  title,
  Icon,
  tone,
  items,
  selected,
  setSelected,
  onApply,
  verb,
  emptyText,
}: {
  title: string
  Icon: LucideIcon
  tone: 'turquoise' | 'duplicate'
  items: CollectionItem[]
  selected: Set<number>
  setSelected: (s: Set<number>) => void
  onApply: () => void
  verb: string
  emptyText: string
}) {
  const toneText = tone === 'duplicate' ? 'text-duplicate' : 'text-turquoise'
  const chipSel =
    tone === 'duplicate'
      ? 'bg-duplicate/20 ring-duplicate text-duplicate'
      : 'bg-turquoise/20 ring-turquoise text-turquoise'
  const applyBg =
    tone === 'duplicate' ? 'bg-duplicate text-white' : 'bg-turquoise text-black'

  const chosen = items.filter((it) => selected.has(it.id)).length
  const allSel = items.length > 0 && chosen === items.length

  const toggleId = (id: number) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
    haptic('selection')
  }
  const toggleGroup = (groupItems: CollectionItem[]) => {
    const all = groupItems.every((it) => selected.has(it.id))
    const next = new Set(selected)
    for (const it of groupItems) {
      if (all) next.delete(it.id)
      else next.add(it.id)
    }
    setSelected(next)
    haptic('selection')
  }
  const toggleAll = () =>
    setSelected(allSel ? new Set() : new Set(items.map((it) => it.id)))

  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between">
        <div className={`flex items-center gap-2 ${toneText}`}>
          <Icon size={16} />
          <h3 className="font-display text-sm font-bold">{title}</h3>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className={`text-xs font-semibold ${toneText} active:opacity-70`}
          >
            {allSel ? 'Niciunul' : 'Tot'}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-fg-muted">{emptyText}</p>
      ) : (
        <>
          <div className="space-y-3">
            {groupByCountry(items).map((g) => {
              const gSel = g.items.filter((it) => selected.has(it.id)).length
              const gAll = gSel === g.items.length
              return (
                <div key={g.code}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(g.items)}
                    className="mb-1.5 flex w-full items-center gap-1.5"
                  >
                    <Flag
                      code={g.code}
                      className="h-3 w-4 rounded-[2px] ring-1 ring-black/10"
                    />
                    <span
                      className={`font-display text-sm font-bold ${gAll ? toneText : 'text-fg'}`}
                    >
                      {g.name}
                    </span>
                    <span className="ml-auto text-[11px] tabnum text-fg-muted">
                      {gSel}/{g.items.length}
                    </span>
                  </button>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((it) => {
                      const on = selected.has(it.id)
                      return (
                        <button
                          key={it.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleId(it.id)}
                          className={`min-w-[2.4rem] rounded-[9px] px-2 py-1.5 text-sm font-bold tabnum ring-1 transition active:scale-90 ${
                            on ? chipSel : 'bg-surface-2 text-fg ring-border'
                          }`}
                        >
                          {numOf(it)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            disabled={!chosen}
            onClick={onApply}
            className={`mt-3 w-full rounded-[12px] py-2.5 text-sm font-bold transition active:scale-[0.98] disabled:opacity-40 ${applyBg}`}
          >
            {chosen ? `${verb} ${chosen}` : `Alege ce ${verb === 'Ia' ? 'iei' : 'dai'}`}
          </button>
        </>
      )}
    </section>
  )
}

function FriendCard({
  friend,
  myItems,
  onApplyTrade,
  onRemove,
}: {
  friend: FriendProfile
  myItems: CollectionItem[]
  onApplyTrade: (get: CollectionItem[], give: CollectionItem[]) => void
  onRemove: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [getSel, setGetSel] = useState<Set<number>>(new Set())
  const [giveSel, setGiveSel] = useState<Set<number>>(new Set())
  const stickers = useFriendStickers(friend.id)
  const rows = stickers.data ?? []

  const { get, give, friendMissing, friendDupes } = useMemo(() => {
    const fc = new Map<number, number>()
    for (const r of rows) fc.set(r.sticker_id, r.count)
    const get: CollectionItem[] = []
    const give: CollectionItem[] = []
    for (const it of myItems) {
      const theirs = fc.get(it.id) ?? 0
      if (theirs >= 2 && it.count === 0) get.push(it)
      if (it.count >= 2 && theirs === 0) give.push(it)
    }
    return {
      get,
      give,
      friendMissing: myItems.length
        ? myItems.length - rows.filter((r) => r.count >= 1).length
        : 0,
      friendDupes: rows.reduce((n, r) => n + Math.max(0, r.count - 1), 0),
    }
  }, [rows, myItems])

  const getChosen = get.filter((it) => getSel.has(it.id))
  const giveChosen = give.filter((it) => giveSel.has(it.id))

  const confirmGet = () => {
    onApplyTrade(getChosen, [])
    setGetSel(new Set())
  }
  const confirmGive = () => {
    onApplyTrade([], giveChosen)
    setGiveSel(new Set())
  }
  const swapAll = () => {
    onApplyTrade(get, give)
    setGetSel(new Set())
    setGiveSel(new Set())
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
      <div className="flex items-center gap-2 p-4">
        <Avatar name={friend.name} src={friend.avatar} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={confirming}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-base font-bold">
              {friend.name}
            </div>
            <div className="text-xs text-fg-muted">
              {friendMissing} lipsă · {friendDupes} dubluri
            </div>
          </div>
          {!confirming && (
            <ChevronDown
              size={20}
              className={`shrink-0 text-fg-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label="Șterge prieten"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-fg-muted active:scale-90"
        >
          <X size={14} />
        </button>
      </div>

      {confirming ? (
        <div className="mx-4 mb-4 rounded-[12px] border border-danger/30 bg-danger/10 p-3">
          <p className="font-display text-sm font-bold text-fg">Ești sigur?</p>
          <p className="mt-0.5 text-xs text-fg-muted">
            Îl ștergi pe {friend.name} din lista ta de prieteni.
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-[10px] bg-surface-2 py-2 text-sm font-bold active:scale-[0.98]"
            >
              Anulează
            </button>
            <button
              type="button"
              onClick={() => onRemove(friend.id)}
              className="flex-1 rounded-[10px] bg-danger py-2 text-sm font-bold text-white active:scale-[0.98]"
            >
              Șterge
            </button>
          </div>
        </div>
      ) : stickers.isLoading ? (
        <div className="px-4 pb-4">
          <TileSkeleton className="h-14 w-full" />
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid w-full grid-cols-2 gap-2 px-4 pb-4"
          >
            <div className="flex items-center justify-center gap-2.5 rounded-[12px] bg-turquoise/15 py-3">
              <ArrowDownLeft size={20} className="shrink-0 text-turquoise" />
              <div className="text-left">
                <div className="font-display text-2xl font-extrabold leading-none tabnum text-turquoise">
                  {get.length}
                </div>
                <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
                  Primești
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2.5 rounded-[12px] bg-duplicate/15 py-3">
              <ArrowUpRight size={20} className="shrink-0 text-duplicate" />
              <div className="text-left">
                <div className="font-display text-2xl font-extrabold leading-none tabnum text-duplicate">
                  {give.length}
                </div>
                <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
                  Dai
                </div>
              </div>
            </div>
          </button>

          {open && (
            <div className="space-y-5 border-t border-border px-4 py-4">
              {get.length > 0 && give.length > 0 && (
                <button
                  type="button"
                  onClick={swapAll}
                  className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-turquoise to-duplicate py-3 font-bold text-white transition active:scale-[0.98]"
                >
                  <ArrowLeftRight size={18} /> Schimbă tot
                  <span className="text-xs font-semibold opacity-90">
                    ia {get.length} · dă {give.length}
                  </span>
                </button>
              )}

              <SwapSection
                title={`Iei de la ${friend.name}`}
                Icon={ArrowDownLeft}
                tone="turquoise"
                items={get}
                selected={getSel}
                setSelected={setGetSel}
                onApply={confirmGet}
                verb="Ia"
                emptyText="Nimic de luat de la el."
              />

              <div className="h-px bg-border" />

              <SwapSection
                title="Îi dai"
                Icon={ArrowUpRight}
                tone="duplicate"
                items={give}
                selected={giveSel}
                setSelected={setGiveSel}
                onApply={confirmGive}
                verb="Dă"
                emptyText="Nimic de dat acum."
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function FriendsScreen() {
  const { items: myItems } = useCollection()
  const bulk = useBulkSetCount()
  const friendsQ = useFriends()
  const qc = useQueryClient()
  const { hash } = useLocation()
  const { doAdd } = useAddFriend()
  const [undo, setUndo] = useState<{
    ops: { id: number; count: number }[]
    message: string
  } | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Someone opening your share link (".../friends#add=CODE") gets added on land.
  useEffect(() => {
    const m = hash.match(/add=([A-Za-z0-9]+)/)
    if (m) doAdd(m[1])
  }, [hash, doAdd])
  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current)
    },
    [],
  )

  const flashUndo = (ops: { id: number; count: number }[], message: string) => {
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndo({ ops, message })
    undoTimer.current = setTimeout(() => setUndo(null), 6000)
  }

  const applyTrade = (getItems: CollectionItem[], giveItems: CollectionItem[]) => {
    const ops = [
      ...getItems.map((it) => ({ id: it.id, count: Math.max(it.count, 1) })),
      ...giveItems.map((it) => ({ id: it.id, count: Math.max(0, it.count - 1) })),
    ]
    if (!ops.length) return
    // Snapshot the previous counts so the swap is undoable.
    const prev = [...getItems, ...giveItems].map((it) => ({
      id: it.id,
      count: it.count,
    }))
    bulk.mutate(ops)
    haptic('success')
    const parts: string[] = []
    if (getItems.length) parts.push(`${getItems.length} primite`)
    if (giveItems.length) parts.push(`${giveItems.length} date`)
    flashUndo(prev, parts.join(' · '))
  }

  const onUndo = () => {
    if (!undo) return
    bulk.mutate(undo.ops)
    haptic('selection')
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndo(null)
  }

  const remove = async (id: string) => {
    hideFriend(id)
    haptic('selection')
    await removeFriendship(id)
    qc.invalidateQueries({ queryKey: ['friends'] })
  }

  const friends = friendsQ.data ?? []

  return (
    <div className="anim-fade-up px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <section className="anim-fade-up relative mb-4 overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-surface-2 to-surface p-4">
        <div className="anim-float pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-turquoise/20 blur-2xl" />
        <img
          src={wc26}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-3 h-24 w-auto opacity-[0.12]"
        />
        <p className="relative font-display text-[10px] font-bold uppercase tracking-[0.22em] text-turquoise">
          Schimburi live
        </p>
        <h1 className="relative mt-0.5 font-display text-2xl font-extrabold">
          Prieteni
        </h1>
        <p className="relative mt-1 text-sm text-fg-muted">
          {friends.length === 0
            ? 'Adaugă un prieten ca să vedeți ce vă puteți da.'
            : 'Vedeți, în timp real, ce vă puteți da unul altuia.'}
        </p>
        {friends.length > 0 && (
          <div className="relative mt-3 flex items-center gap-2.5">
            <div className="flex -space-x-2.5">
              {friends.slice(0, 5).map((f) =>
                f.avatar ? (
                  <img
                    key={f.id}
                    src={f.avatar}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-surface"
                  />
                ) : (
                  <div
                    key={f.id}
                    className="grid h-8 w-8 place-items-center rounded-full bg-turquoise/25 font-display text-xs font-bold text-turquoise ring-2 ring-surface"
                  >
                    {f.name.charAt(0).toUpperCase()}
                  </div>
                ),
              )}
            </div>
            <span className="text-sm font-semibold text-fg-muted">
              {friends.length} {friends.length === 1 ? 'prieten' : 'prieteni'}
            </span>
          </div>
        )}
      </section>

      <Link
        to="/friends/add"
        className="mb-4 flex items-center justify-center gap-2 rounded-[14px] bg-turquoise py-3.5 font-bold text-black transition active:scale-[0.98]"
      >
        <UserPlus size={18} /> Adaugă un prieten
      </Link>

      {friendsQ.isLoading ? (
        <TileSkeleton className="h-24 w-full" />
      ) : friends.length === 0 ? (
        <EmptyState
          title="Niciun prieten încă"
          icon={<Users size={32} className="text-fg-muted" />}
        >
          Apasă „Adaugă un prieten” ca să-i arăți codul tău sau să-l adaugi pe al
          lui, și să comparați albumele.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {friends.map((f) => (
            <FriendCard
              key={f.id}
              friend={f}
              myItems={myItems}
              onApplyTrade={applyTrade}
              onRemove={remove}
            />
          ))}
        </div>
      )}

      {undo && (
        <Snackbar message={undo.message} actionLabel="Anulează" onAction={onUndo} />
      )}
    </div>
  )
}
