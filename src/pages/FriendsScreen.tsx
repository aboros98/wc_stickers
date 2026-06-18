import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  UserPlus,
  Users,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Flame,
  type LucideIcon,
} from 'lucide-react'
import { useCollection } from '../data/useCollection'
import {
  useFriendsStickers,
  useFriends,
  useAddFriend,
  useTrades,
  proposeTrade,
  acceptTrade,
  cancelTrade,
  removeFriendship,
  type FriendProfile,
} from '../data/friends'
import { useAuth } from '../auth/AuthProvider'
import { hideFriend, unhideFriend } from '../lib/friends'
import { haptic } from '../lib/haptics'
import { Flag } from '../components/Flag'
import { Snackbar } from '../components/Snackbar'
import { TradesPanel } from '../components/TradesPanel'
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
    <div className="grid h-11 w-11 place-items-center rounded-full bg-turquoise/20 font-display text-lg font-bold text-turquoise-text">
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
  emptyText,
}: {
  title: string
  Icon: LucideIcon
  tone: 'turquoise' | 'duplicate'
  items: CollectionItem[]
  selected: Set<number>
  setSelected: (s: Set<number>) => void
  emptyText: string
}) {
  const toneText =
    tone === 'duplicate' ? 'text-duplicate' : 'text-turquoise-text'
  const chipSel =
    tone === 'duplicate'
      ? 'bg-duplicate ring-duplicate text-white'
      : 'bg-turquoise ring-turquoise text-black'

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
        </>
      )}
    </section>
  )
}

function FriendCard({
  friend,
  trade,
  loading,
  onPropose,
  onRemove,
}: {
  friend: FriendProfile
  trade: { get: CollectionItem[]; give: CollectionItem[] }
  loading: boolean
  onPropose: (
    friendId: string,
    giveItems: CollectionItem[],
    takeItems: CollectionItem[],
  ) => void
  onRemove: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [getSel, setGetSel] = useState<Set<number>>(new Set())
  const [giveSel, setGiveSel] = useState<Set<number>>(new Set())

  const { get, give } = trade
  const total = get.length + give.length

  const getChosen = get.filter((it) => getSel.has(it.id))
  const giveChosen = give.filter((it) => giveSel.has(it.id))
  const chosenTotal = getChosen.length + giveChosen.length

  const sendProposal = () => {
    if (!chosenTotal) return
    onPropose(friend.id, giveChosen, getChosen)
    setGetSel(new Set())
    setGiveSel(new Set())
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
      {/* Compact tappable summary row */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors active:bg-surface-2/50"
      >
        <Avatar name={friend.name} src={friend.avatar} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-base font-bold">
            {friend.name}
          </div>
          {loading ? (
            <div className="mt-1.5 h-3 w-28 animate-pulse rounded-full bg-surface-2" />
          ) : total === 0 ? (
            <div className="mt-0.5 text-xs text-fg-muted">Niciun schimb acum</div>
          ) : (
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-bold">
              <span className="inline-flex items-center gap-1 text-turquoise-text">
                <ArrowDownLeft size={13} className="shrink-0" /> {get.length}{' '}
                primești
              </span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1 text-duplicate">
                <ArrowUpRight size={13} className="shrink-0" /> {give.length} dai
              </span>
            </div>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`shrink-0 text-fg-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4">
          {confirming ? (
            <div className="rounded-[12px] border border-danger/30 bg-danger/10 p-3">
              <p className="font-display text-sm font-bold text-fg">
                Ești sigur?
              </p>
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
          ) : loading ? (
            <TileSkeleton className="h-20 w-full" />
          ) : (
            <div className="space-y-5">
              {total === 0 ? (
                <p className="py-1 text-center text-sm text-fg-muted">
                  Nimic de schimbat cu {friend.name} deocamdată.
                </p>
              ) : (
                <>
                  <SwapSection
                    title={`Iei de la ${friend.name}`}
                    Icon={ArrowDownLeft}
                    tone="turquoise"
                    items={get}
                    selected={getSel}
                    setSelected={setGetSel}
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
                    emptyText="Nimic de dat acum."
                  />

                  <button
                    type="button"
                    disabled={!chosenTotal}
                    onClick={sendProposal}
                    className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-primary py-3 font-bold text-black transition active:scale-[0.98] disabled:opacity-40"
                  >
                    <ArrowLeftRight size={18} />
                    {chosenTotal
                      ? `Propune schimb · iei ${getChosen.length} · dai ${giveChosen.length}`
                      : 'Alege ce schimbi'}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-danger active:opacity-70"
              >
                <X size={13} /> Șterge prietenul
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MiniAvatar({ name, src }: { name: string; src?: string | null }) {
  return src ? (
    <img
      src={src}
      alt=""
      className="h-6 w-6 rounded-full object-cover ring-2 ring-surface"
    />
  ) : (
    <div className="grid h-6 w-6 place-items-center rounded-full bg-turquoise/25 text-[10px] font-bold text-turquoise ring-2 ring-surface">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

/** Your spares ranked by how many friends are missing them. */
function DemandPanel({
  demand,
}: {
  demand: { item: CollectionItem; wanters: FriendProfile[] }[]
}) {
  const [open, setOpen] = useState(false)
  const hot = demand.filter((d) => d.wanters.length >= 2).length
  const shown = open ? demand : demand.slice(0, 5)

  return (
    <div className="mb-4 overflow-hidden rounded-[16px] border border-border bg-surface">
      <div className="flex items-center gap-3 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
          <Flame size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-bold">
            Dublurile tale căutate
          </div>
          <div className="text-xs text-fg-muted">
            {demand.length} cerute de prieteni
            {hot > 0 && ` · ${hot} de mai mulți`}
          </div>
        </div>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {shown.map(({ item, wanters }) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
            <Flag
              code={item.country_code}
              className="h-4 w-6 shrink-0 rounded-[2px] ring-1 ring-black/10"
            />
            <span className="font-display text-sm font-bold tabnum">
              {item.sticker_code}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {wanters.slice(0, 3).map((f) => (
                  <MiniAvatar key={f.id} name={f.name} src={f.avatar} />
                ))}
              </div>
              <span
                className={`grid h-6 min-w-[1.5rem] place-items-center rounded-full px-1.5 text-xs font-bold tabnum ${
                  wanters.length >= 2
                    ? 'bg-gold/20 text-gold'
                    : 'bg-surface-2 text-fg-muted'
                }`}
              >
                {wanters.length}
              </span>
            </div>
          </div>
        ))}
      </div>

      {demand.length > 5 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-xs font-semibold text-turquoise active:opacity-70"
        >
          {open ? (
            <>
              <ChevronUp size={14} /> Mai puține
            </>
          ) : (
            <>
              <ChevronDown size={14} /> Vezi toate ({demand.length})
            </>
          )}
        </button>
      )}
    </div>
  )
}

export function FriendsScreen() {
  const { items: myItems } = useCollection()
  const { user } = useAuth()
  const meId = user?.id ?? ''
  const friendsQ = useFriends()
  const tradesQ = useTrades()
  const qc = useQueryClient()
  const { hash, pathname } = useLocation()
  const navigate = useNavigate()
  const { doAdd } = useAddFriend()
  const [toast, setToast] = useState<string | null>(null)
  const [tradeBusy, setTradeBusy] = useState<string | null>(null)

  // Someone opening your share link (".../friends#add=CODE") gets added on land —
  // report the outcome and clear the hash so a refresh doesn't silently re-run it.
  useEffect(() => {
    const m = hash.match(/add=([A-Za-z0-9]+)/)
    if (!m) return
    doAdd(m[1]).then((ok) =>
      setToast(ok ? 'Prieten adăugat!' : 'Nu am putut adăuga prietenul.'),
    )
    navigate(pathname, { replace: true })
  }, [hash, pathname, doAdd, navigate])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const propose = async (
    friendId: string,
    giveItems: CollectionItem[],
    takeItems: CollectionItem[],
  ) => {
    try {
      await proposeTrade(
        friendId,
        giveItems.map((it) => it.id),
        takeItems.map((it) => it.id),
      )
      haptic('success')
      setToast('Propunere trimisă!')
      qc.invalidateQueries({ queryKey: ['trades'] })
    } catch {
      setToast('Nu am putut trimite propunerea.')
    }
  }

  const accept = async (id: string) => {
    setTradeBusy(id)
    try {
      await acceptTrade(id)
      haptic('success')
      setToast('Schimb finalizat! 🎉')
      qc.invalidateQueries({ queryKey: ['trades'] })
      qc.invalidateQueries({ queryKey: ['user_stickers'] })
      qc.invalidateQueries({ queryKey: ['friends_stickers'] })
    } catch {
      setToast('Nu am putut accepta schimbul.')
    } finally {
      setTradeBusy(null)
    }
  }

  const decline = async (id: string) => {
    setTradeBusy(id)
    try {
      await cancelTrade(id)
      qc.invalidateQueries({ queryKey: ['trades'] })
    } catch {
      setToast('Eroare. Încearcă din nou.')
    } finally {
      setTradeBusy(null)
    }
  }

  const remove = async (id: string) => {
    hideFriend(id)
    haptic('selection')
    // Optimistically drop from the list, roll back if the server delete fails.
    qc.setQueriesData<FriendProfile[]>({ queryKey: ['friends'] }, (old) =>
      old ? old.filter((f) => f.id !== id) : old,
    )
    const ok = await removeFriendship(id)
    if (!ok) {
      unhideFriend(id)
      setToast('Nu am putut șterge prietenul.')
    }
    qc.invalidateQueries({ queryKey: ['friends'] })
  }

  const friends = friendsQ.data ?? []
  const friendIds = friends.map((f) => f.id)
  const allFriendStickers = useFriendsStickers(friendIds)
  const tradesLoading = allFriendStickers.isLoading && !allFriendStickers.data

  // Compute every friend's get/give from the single shared query.
  const friendTrades = useMemo(() => {
    const map = new Map<
      string,
      { get: CollectionItem[]; give: CollectionItem[] }
    >()
    if (!allFriendStickers.data) return map
    const haveByFriend = new Map<string, Map<number, number>>()
    for (const r of allFriendStickers.data) {
      let m = haveByFriend.get(r.user_id)
      if (!m) haveByFriend.set(r.user_id, (m = new Map()))
      m.set(r.sticker_id, r.count)
    }
    for (const f of friends) {
      const fc = haveByFriend.get(f.id)
      // No rows at all = album unknown / not synced yet. Don't guess they "need"
      // everything, or we'd offer to give them all our spares (and inflate demand).
      if (!fc) {
        map.set(f.id, { get: [], give: [] })
        continue
      }
      const get: CollectionItem[] = []
      const give: CollectionItem[] = []
      for (const it of myItems) {
        const theirs = fc.get(it.id) ?? 0
        if (theirs >= 2 && it.count === 0) get.push(it)
        if (it.count >= 2 && theirs === 0) give.push(it)
      }
      map.set(f.id, { get, give })
    }
    return map
  }, [allFriendStickers.data, myItems, friends])

  // Friends with the most to trade float to the top.
  const sortedFriends = useMemo(
    () =>
      [...friends].sort((a, b) => {
        const ta = friendTrades.get(a.id)
        const tb = friendTrades.get(b.id)
        const sa = ta ? ta.get.length + ta.give.length : 0
        const sb = tb ? tb.get.length + tb.give.length : 0
        return sb - sa || a.name.localeCompare(b.name)
      }),
    [friends, friendTrades],
  )

  // Your spares ranked by how many friends are missing them (= their "give").
  const demand = useMemo(() => {
    const byItem = new Map<
      number,
      { item: CollectionItem; wanters: FriendProfile[] }
    >()
    for (const f of friends) {
      const t = friendTrades.get(f.id)
      if (!t) continue
      for (const it of t.give) {
        let e = byItem.get(it.id)
        if (!e) byItem.set(it.id, (e = { item: it, wanters: [] }))
        e.wanters.push(f)
      }
    }
    return [...byItem.values()].sort(
      (a, b) => b.wanters.length - a.wanters.length || a.item.id - b.item.id,
    )
  }, [friends, friendTrades])

  const trades = tradesQ.data ?? []
  const nameOf = (id: string) =>
    friends.find((f) => f.id === id)?.name ?? 'Prieten'
  const codeById = useMemo(() => {
    const m = new Map<number, string>()
    for (const it of myItems) m.set(it.id, it.sticker_code)
    return m
  }, [myItems])
  const codeOf = (id: number) => codeById.get(id) ?? String(id)

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
        <p className="relative font-display text-[10px] font-bold uppercase tracking-[0.22em] text-turquoise-text">
          Schimburi live
        </p>
        <h1 className="relative mt-0.5 font-display text-2xl font-extrabold">
          Prieteni
        </h1>
        <p className="relative mt-1 text-sm text-fg-muted">
          {friends.length === 0
            ? 'Adaugă un prieten ca să vezi ce poți schimba cu el.'
            : 'Vezi, în timp real, ce poți primi și ce poți da.'}
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
        className="mb-4 flex items-center justify-center gap-2 rounded-[12px] bg-primary py-3.5 font-bold text-black transition active:scale-[0.98]"
      >
        <UserPlus size={18} /> Adaugă un prieten
      </Link>

      {trades.length > 0 && (
        <TradesPanel
          trades={trades}
          meId={meId}
          nameOf={nameOf}
          codeOf={codeOf}
          onAccept={accept}
          onDecline={decline}
          busyId={tradeBusy}
        />
      )}

      {demand.length > 0 && <DemandPanel demand={demand} />}

      {friendsQ.isLoading ? (
        <TileSkeleton className="h-24 w-full" />
      ) : friends.length === 0 ? (
        <EmptyState
          title="Niciun prieten încă"
          icon={<Users size={32} className="text-fg-muted" />}
        >
          Apasă „Adaugă un prieten” ca să-i arăți codul tău sau să-l adaugi pe al
          lui și să compari albumele.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {sortedFriends.map((f) => (
            <FriendCard
              key={f.id}
              friend={f}
              trade={friendTrades.get(f.id) ?? { get: [], give: [] }}
              loading={tradesLoading}
              onPropose={propose}
              onRemove={remove}
            />
          ))}
        </div>
      )}

      {toast && <Snackbar message={toast} />}
    </div>
  )
}
