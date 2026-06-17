import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import {
  Copy,
  Share2,
  ScanLine,
  UserPlus,
  Users,
  X,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import { useCollection, useBulkSetCount } from '../data/useCollection'
import {
  useMyProfile,
  fetchProfileByCode,
  useFriendStickers,
  useFriends,
  addFriendship,
  removeFriendship,
  type FriendProfile,
} from '../data/friends'
import { hideFriend, unhideFriend } from '../lib/friends'
import { copyText, shareText } from '../lib/share'
import { haptic } from '../lib/haptics'
import { ActionButton } from '../components/ActionButton'
import { MatchGrid } from '../components/MatchGrid'
import { EmptyState } from '../components/EmptyState'
import { TileSkeleton } from '../components/TileSkeleton'
import { QrScannerSheet } from '../components/QrScannerSheet'
import type { CollectionItem } from '../lib/types'

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

function FriendCard({
  friend,
  myItems,
  onApplyGet,
  onApplyGive,
  onRemove,
}: {
  friend: FriendProfile
  myItems: CollectionItem[]
  onApplyGet: (items: CollectionItem[]) => void
  onApplyGive: (items: CollectionItem[]) => void
  onRemove: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
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

  // Selection is derived against the live lists, so it self-prunes when the
  // friend's collection refetches or items get applied.
  const getChosen = get.filter((it) => getSel.has(it.id))
  const giveChosen = give.filter((it) => giveSel.has(it.id))
  const allGet = get.length > 0 && getChosen.length === get.length
  const allGive = give.length > 0 && giveChosen.length === give.length

  const toggle = (which: 'get' | 'give', id: number) => {
    if (which === 'get') {
      const next = new Set(getSel)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setGetSel(next)
    } else {
      const next = new Set(giveSel)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setGiveSel(next)
    }
    haptic('selection')
  }
  const toggleAll = (which: 'get' | 'give') => {
    if (which === 'get')
      setGetSel(allGet ? new Set() : new Set(get.map((it) => it.id)))
    else setGiveSel(allGive ? new Set() : new Set(give.map((it) => it.id)))
  }
  const confirmGet = () => {
    onApplyGet(getChosen)
    setGetSel(new Set())
  }
  const confirmGive = () => {
    onApplyGive(giveChosen)
    setGiveSel(new Set())
  }

  return (
    <div className="rounded-[16px] border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <Avatar name={friend.name} src={friend.avatar} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="truncate font-display text-base font-bold">
            {friend.name}
          </div>
          <div className="text-xs text-fg-muted">
            {friendMissing} lipsă · {friendDupes} dubluri
          </div>
        </button>
        <button
          type="button"
          onClick={() => onRemove(friend.id)}
          aria-label="Șterge prieten"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-fg-muted"
        >
          <X size={14} />
        </button>
      </div>

      {stickers.isLoading ? (
        <TileSkeleton className="mt-3 h-12 w-full" />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mt-3 grid w-full grid-cols-2 gap-2 text-center"
          >
            <div className="rounded-[10px] bg-turquoise/15 py-2">
              <div className="font-display text-2xl font-extrabold tabnum text-turquoise">
                {get.length}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
                Primești
              </div>
            </div>
            <div className="rounded-[10px] bg-duplicate/15 py-2">
              <div className="font-display text-2xl font-extrabold tabnum text-duplicate">
                {give.length}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
                Dai
              </div>
            </div>
          </button>

          {open && (
            <div className="mt-4 space-y-5">
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-turquoise">
                    <ArrowDownLeft size={16} />
                    <h3 className="font-display text-sm font-bold">
                      Iei de la {friend.name}
                    </h3>
                  </div>
                  {get.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleAll('get')}
                      className="text-xs font-semibold text-turquoise active:opacity-70"
                    >
                      {allGet ? 'Niciunul' : 'Tot'}
                    </button>
                  )}
                </div>
                <MatchGrid
                  items={get}
                  selected={getSel}
                  onToggle={(id) => toggle('get', id)}
                  tone="turquoise"
                  empty="Nimic de luat."
                />
                {get.length > 0 && (
                  <button
                    type="button"
                    disabled={!getChosen.length}
                    onClick={confirmGet}
                    className="mt-2.5 w-full rounded-[12px] bg-turquoise py-2.5 text-sm font-bold text-black transition active:scale-[0.98] disabled:opacity-40"
                  >
                    {getChosen.length ? `Ia ${getChosen.length}` : 'Alege ce iei'}
                  </button>
                )}
              </section>

              <div className="h-px bg-border" />

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-duplicate">
                    <ArrowUpRight size={16} />
                    <h3 className="font-display text-sm font-bold">Îi dai</h3>
                  </div>
                  {give.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleAll('give')}
                      className="text-xs font-semibold text-duplicate active:opacity-70"
                    >
                      {allGive ? 'Niciunul' : 'Tot'}
                    </button>
                  )}
                </div>
                <MatchGrid
                  items={give}
                  selected={giveSel}
                  onToggle={(id) => toggle('give', id)}
                  tone="duplicate"
                  empty="Nimic de dat."
                />
                {give.length > 0 && (
                  <button
                    type="button"
                    disabled={!giveChosen.length}
                    onClick={confirmGive}
                    className="mt-2.5 w-full rounded-[12px] bg-duplicate py-2.5 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
                  >
                    {giveChosen.length ? `Dă ${giveChosen.length}` : 'Alege ce dai'}
                  </button>
                )}
              </section>

              <p className="text-center text-[11px] text-fg-muted">
                Atinge abțibildurile, apoi apasă Ia / Dă.
              </p>
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
  const myProfile = useMyProfile()
  const friendsQ = useFriends()
  const qc = useQueryClient()
  const { hash } = useLocation()
  const [input, setInput] = useState('')
  const [scanOpen, setScanOpen] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const myCode = myProfile.data?.friend_code ?? ''
  const myLink = myCode
    ? `${window.location.origin}${import.meta.env.BASE_URL}friends#add=${myCode}`
    : ''

  const doAdd = useCallback(
    async (raw: string) => {
      const m = raw.match(/add=([A-Za-z0-9]+)/)
      const code = (m ? m[1] : raw).trim().toUpperCase()
      if (!code) return
      if (myCode && code === myCode) {
        setMsg('Acesta e codul tău.')
        return
      }
      const p = await fetchProfileByCode(code)
      if (!p) {
        setMsg('Cod negăsit.')
        return
      }
      unhideFriend(p.id)
      await addFriendship(p.id)
      qc.invalidateQueries({ queryKey: ['friends'] })
      setMsg(`${p.name} adăugat!`)
      setInput('')
    },
    [myCode, qc],
  )

  useEffect(() => {
    const m = hash.match(/add=([A-Za-z0-9]+)/)
    if (m) doAdd(m[1])
  }, [hash, doAdd])

  const applyGet = (its: CollectionItem[]) => {
    if (!its.length) return
    bulk.mutate(its.map((it) => ({ id: it.id, count: Math.max(it.count, 1) })))
    haptic('success')
  }
  const applyGive = (its: CollectionItem[]) => {
    if (!its.length) return
    bulk.mutate(its.map((it) => ({ id: it.id, count: Math.max(0, it.count - 1) })))
    haptic('success')
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
      <section className="mb-4 overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-surface-2 to-surface p-4">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-fg-muted">
          Schimburi live
        </p>
        <h1 className="font-display text-2xl font-extrabold">Prieteni</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Adaugă un prieten ca să vedeți, în timp real, ce vă puteți da unul
          altuia.
        </p>
      </section>

      <div className="mb-4 rounded-[16px] border border-border bg-surface p-4 text-center">
        <h2 className="mb-2 font-display text-base font-bold">Codul tău</h2>
        {myLink && (
          <div className="mx-auto inline-block rounded-[14px] bg-white p-3">
            <QRCodeSVG value={myLink} size={148} bgColor="#ffffff" fgColor="#0A0A0C" />
          </div>
        )}
        <p className="mt-3 font-display text-xl font-black tracking-[0.3em] text-turquoise">
          {myCode || '········'}
        </p>
        <p className="mt-1 text-xs text-fg-muted">
          Trimite-l unui prieten — când te adaugă, apare automat și la tine.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <ActionButton
            icon={<Copy size={16} />}
            onClick={async () => {
              if (await copyText(myLink || myCode)) haptic('success')
            }}
          >
            Copiază
          </ActionButton>
          <ActionButton
            icon={<Share2 size={16} />}
            onClick={() =>
              shareText(myLink || myCode, 'Adaugă-mă pe albumul Panini WC2026')
            }
          >
            Distribuie
          </ActionButton>
        </div>
      </div>

      <div className="mb-5 rounded-[16px] border border-border bg-surface p-4">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
          <UserPlus size={16} /> Adaugă un prieten
        </h2>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cod sau link"
            autoCapitalize="characters"
            autoCorrect="off"
            className="h-11 flex-1 rounded-[12px] border border-border bg-surface-2 px-3 text-base outline-none focus:border-turquoise"
          />
          <button
            type="button"
            onClick={() => doAdd(input)}
            className="rounded-[12px] bg-primary px-4 font-bold text-black active:scale-95"
          >
            Adaugă
          </button>
        </div>
        <button
          type="button"
          onClick={() => setScanOpen(true)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-[12px] bg-surface-2 py-3 text-sm font-semibold active:scale-95"
        >
          <ScanLine size={18} /> Scanează codul lui
        </button>
        {msg && <p className="mt-2 text-center text-sm text-turquoise">{msg}</p>}
      </div>

      {friendsQ.isLoading ? (
        <TileSkeleton className="h-24 w-full" />
      ) : friends.length === 0 ? (
        <EmptyState
          title="Niciun prieten încă"
          icon={<Users size={32} className="text-fg-muted" />}
        >
          Trimite-i codul tău, sau adaugă-l pe al lui, ca să comparați albumele.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {friends.map((f) => (
            <FriendCard
              key={f.id}
              friend={f}
              myItems={myItems}
              onApplyGet={applyGet}
              onApplyGive={applyGive}
              onRemove={remove}
            />
          ))}
        </div>
      )}

      <QrScannerSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onResult={(text) => {
          setScanOpen(false)
          doAdd(text)
        }}
      />
    </div>
  )
}
