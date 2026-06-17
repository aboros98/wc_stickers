import { useRef, useState } from 'react'
import { Image as ImageIcon, Copy, Share2 } from 'lucide-react'
import { useCollection } from '../data/useCollection'
import { useAuth } from '../auth/AuthProvider'
import { ShareCard } from '../components/ShareCard'
import { ActionButton } from '../components/ActionButton'
import { TileSkeleton } from '../components/TileSkeleton'
import { shareImage, shareText, copyText } from '../lib/share'
import { haptic } from '../lib/haptics'

export function ShareScreen() {
  const { progress, isLoading } = useCollection()
  const { user } = useAuth()
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  const username = user?.email ? user.email.split('@')[0] : null
  const pct = progress.total ? Math.round((progress.have / progress.total) * 100) : 0
  const summary = `Albumul meu Panini Cupa Mondială 2026: ${progress.have}/${progress.total} (${pct}%) — ${progress.missing} lipsă, ${progress.duplicates} dubluri.`

  if (isLoading) {
    return (
      <div className="px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <TileSkeleton className="mx-auto h-72 w-[360px] max-w-full" />
      </div>
    )
  }

  return (
    <div className="anim-fade-up px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <section className="mb-4 overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-surface-2 to-surface p-4">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-fg-muted">
          Albumul tău
        </p>
        <h1 className="font-display text-2xl font-extrabold">Distribuie</h1>
      </section>

      <div className="flex justify-center">
        <ShareCard
          ref={cardRef}
          progress={progress}
          username={username}
          subtitle={`${pct}% complet`}
        />
      </div>

      <div className="mx-auto mt-6 grid max-w-[360px] grid-cols-3 gap-2">
        <ActionButton
          tone="primary"
          icon={<ImageIcon size={18} />}
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            if (cardRef.current) await shareImage(cardRef.current, summary)
            setBusy(false)
          }}
        >
          Imagine
        </ActionButton>
        <ActionButton icon={<Share2 size={18} />} onClick={() => shareText(summary)}>
          Distribuie
        </ActionButton>
        <ActionButton
          icon={<Copy size={18} />}
          onClick={async () => {
            if (await copyText(summary)) haptic('success')
          }}
        >
          Copiază
        </ActionButton>
      </div>
    </div>
  )
}
