import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Copy, Share2, ScanLine, UserPlus } from 'lucide-react'
import { useAddFriend } from '../data/friends'
import { copyText, shareText } from '../lib/share'
import { haptic } from '../lib/haptics'
import { ActionButton } from '../components/ActionButton'
import { QrScannerSheet } from '../components/QrScannerSheet'

export function AddFriendScreen() {
  const { doAdd, msg, myProfile } = useAddFriend()
  const [input, setInput] = useState('')
  const [scanOpen, setScanOpen] = useState(false)

  const myCode = myProfile.data?.friend_code ?? ''
  const myLink = myCode
    ? `${window.location.origin}${import.meta.env.BASE_URL}friends#add=${myCode}`
    : ''

  const submit = async () => {
    if (await doAdd(input)) {
      setInput('')
      haptic('success')
    }
  }

  return (
    <div className="anim-fade-up px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/friends"
          aria-label="Înapoi la prieteni"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-fg-muted active:scale-95"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-2xl font-extrabold">Adaugă prieten</h1>
      </div>

      <div className="mb-4 rounded-[16px] border border-border bg-surface p-4 text-center">
        <h2 className="mb-2 font-display text-base font-bold">Codul tău</h2>
        {myLink && (
          <div className="mx-auto inline-block rounded-[14px] bg-white p-3">
            <QRCodeSVG
              value={myLink}
              size={172}
              bgColor="#ffffff"
              fgColor="#0A0A0C"
            />
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

      <div className="rounded-[16px] border border-border bg-surface p-4">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
          <UserPlus size={16} /> Adaugă pe al lui
        </h2>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
            placeholder="Cod sau link"
            autoCapitalize="characters"
            autoCorrect="off"
            className="h-11 flex-1 rounded-[12px] border border-border bg-surface-2 px-3 text-base outline-none focus:border-turquoise"
          />
          <button
            type="button"
            onClick={submit}
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
        {msg && (
          <p className="mt-2 text-center text-sm font-semibold text-turquoise">
            {msg}
          </p>
        )}
      </div>

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
