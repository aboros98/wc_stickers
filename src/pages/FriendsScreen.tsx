import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
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
import { useCollection, useSetCount } from '../data/useCollection'
import { useMyProfile, fetchProfileByCode, useFriendStickers } from '../data/friends'
import { getFriends, addFriend, removeFriend, type SavedFriend } from '../lib/friends'
import { copyText, shareText } from '../lib/share'
import { haptic } from '../lib/haptics'
import { ActionButton } from '../components/ActionButton'
import { MatchGrid } from '../components/MatchGrid'
import { EmptyState } from '../components/EmptyState'
import { TileSkeleton } from '../components/TileSkeleton'
import { QrScannerSheet } from '../components/QrScannerSheet'
import type { CollectionItem } from '../lib/types'

function FriendCard({
  friend,
  myItems,
  onApplyGet,
  onApplyGive,
  onRemove,
}: {
  friend: SavedFriend
  myItems: CollectionItem[]
  onApplyGet: (it: CollectionItem) => void
  onApplyGive: (it: CollectionItem) => void
  onRemove: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const stickers = useFriendStickers(friend.id)
  const rows = stickers.data ?? []

  const { get, give, friendMissing, friendDupes } = useMemo(() => {
    const fc = new Map<number, number>()
    for (const r of rows) fc.set(r.sticker_id, r.count)
    const get: CollectionItem[] = []
    const give: CollectionItem[] = []
    for (const it of myItems) {
      const theirs = fc.get(it.id) ?? 0
      if (theirs >= 2 && it.count === 0) get.push(it) // they have spare, I'm missing
      if (it.count >= 2 && theirs === 0) give.push(it) // I have spare, they're missing
    }
    const friendHave = rows.filter((r) => r.count >= 1).length
    return {
      get,
      give,
      friendMissing: myItems.length ? myItems.length - friendHave : 0,
      friendDupes: rows.reduce((n, r) => n + Math.max(0, r.count - 1), 0),
    }
  }, [rows, myItems])

  return (
    <div className="rounded-[16px] border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="truncate font-display text-base font-bold">
            {friend.name}
          </div>
          <div className="text-xs text-fg-muted">cod {friend.code}</div>
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
          <p className="mt-2 text-center text-[11px] text-fg-muted">
            {friend.name}: {friendMissing} lipsă · {friendDupes} dubluri
          </p>

          {open && (
            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-turquoise">
                  <ArrowDownLeft size={16} />
                  <h3 className="font-display text-sm font-bold">
                    Iei de la {friend.name} ({get.length})
                  </h3>
                </div>
                <MatchGrid
                  items={get}
                  onApply={onApplyGet}
                  empty="Nimic de luat de la el."
                />
              </div>
              <div className="h-px bg-border" />
              <div>
                <div className="mb-2 flex items-center gap-2 text-duplicate">
                  <ArrowUpRight size={16} />
                  <h3 className="font-display text-sm font-bold">
                    Îi dai ({give.length})
                  </h3>
                </div>
                <MatchGrid
                  items={give}
                  onApply={onApplyGive}
                  empty="Nimic de dat."
                />
              </div>
              <p className="text-center text-[11px] text-fg-muted">
                Atinge un abțibild ca să bifezi schimbul.
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
  const setCount = useSetCount()
  const myProfile = useMyProfile()
  const { hash } = useLocation()
  const [friends, setFriends] = useState<SavedFriend[]>(() => getFriends())
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
      if (getFriends().some((f) => f.code === code)) {
        setMsg('Prieten deja adăugat.')
        return
      }
      const p = await fetchProfileByCode(code)
      if (!p) {
        setMsg('Cod negăsit.')
        return
      }
      setFriends(addFriend({ id: p.id, code: p.friend_code, name: p.name }))
      setMsg(`${p.name} adăugat!`)
      setInput('')
    },
    [myCode],
  )

  useEffect(() => {
    const m = hash.match(/add=([A-Za-z0-9]+)/)
    if (m) doAdd(m[1])
  }, [hash, doAdd])

  const applyGet = (it: CollectionItem) => {
    setCount.mutate({ stickerId: it.id, count: Math.max(it.count, 1) })
    haptic('success')
  }
  const applyGive = (it: CollectionItem) => {
    setCount.mutate({ stickerId: it.id, count: Math.max(0, it.count - 1) })
    haptic('success')
  }
  const remove = (id: string) => {
    setFriends(removeFriend(id))
    haptic('selection')
  }

  return (
    <div className="anim-fade-up px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <section className="mb-4 overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-surface-2 to-surface p-4">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-fg-muted">
          Schimburi live
        </p>
        <h1 className="font-display text-2xl font-extrabold">Prieteni</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Adaugă un prieten ca să vezi ce poți lua și ce poți da.
        </p>
      </section>

      <div className="mb-4 rounded-[16px] border border-border bg-surface p-4 text-center">
        <h2 className="mb-1 font-display text-base font-bold">Codul tău</h2>
        <p className="font-display text-2xl font-black tracking-widest text-turquoise">
          {myCode || '········'}
        </p>
        {myLink && (
          <div className="mx-auto mt-3 inline-block rounded-[12px] bg-white p-3">
            <QRCodeSVG value={myLink} size={150} bgColor="#ffffff" fgColor="#0A0A0C" />
          </div>
        )}
        <p className="mt-2 text-xs text-fg-muted">
          Prietenul scanează asta ca să vă conectați.
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
            onClick={() => shareText(myLink || myCode, 'Adaugă-mă pe albumul Panini WC2026')}
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

      {friends.length === 0 ? (
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
