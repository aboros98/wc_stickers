import { useMemo, useRef, useState } from 'react'
import { Copy, Share2, Image as ImageIcon, Trophy } from 'lucide-react'
import { useCollection, useSetCount } from '../data/useCollection'
import { exportText } from '../lib/collection'
import { shareText, copyText, shareImage } from '../lib/share'
import { haptic } from '../lib/haptics'
import { ShareCard } from '../components/ShareCard'
import { ActionButton } from '../components/ActionButton'
import { EmptyState } from '../components/EmptyState'
import { TileSkeleton } from '../components/TileSkeleton'
import { Flag } from '../components/Flag'

export function MissingScreen() {
  const { sections, progress, isLoading } = useCollection()
  const setCount = useSetCount()
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  const missingSections = useMemo(
    () =>
      sections
        .map((s) => ({ ...s, missing: s.items.filter((i) => i.count === 0) }))
        .filter((s) => s.missing.length > 0),
    [sections],
  )

  const text = useMemo(
    () =>
      exportText(
        sections,
        (i) => i.count === 0,
        (i) => (i.country_code === 'FWC' ? i.sticker_code : String(i.slot_no)),
      ),
    [sections],
  )
  const lines = text ? text.split('\n') : []

  if (isLoading) {
    return (
      <div className="space-y-3 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
        {Array.from({ length: 8 }).map((_, i) => (
          <TileSkeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="mb-4">
        <h1 className="font-display text-3xl font-extrabold tabnum">
          {progress.missing} <span className="text-fg-muted">lipsă</span>
        </h1>
        <p className="text-sm text-fg-muted">
          Atinge un număr pe care l-ai găsit ca să-l marchezi colectat.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-2">
        <ActionButton
          icon={<Copy size={16} />}
          onClick={async () => {
            if (await copyText(text)) haptic('success')
          }}
        >
          Copiază
        </ActionButton>
        <ActionButton
          icon={<Share2 size={16} />}
          onClick={() => shareText(text, 'Panini Cupa Mondială 2026 — abțibilduri căutate')}
        >
          Distribuie
        </ActionButton>
        <ActionButton
          icon={<ImageIcon size={16} />}
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            if (cardRef.current)
              await shareImage(cardRef.current, 'Panini Cupa Mondială 2026 — abțibilduri căutate')
            setBusy(false)
          }}
        >
          Imagine
        </ActionButton>
      </div>

      {missingSections.length === 0 ? (
        <EmptyState
          title="Nimic lipsă 🎉"
          icon={<Trophy size={32} className="text-gold" />}
        >
          Ai completat albumul. Distribuie reușita!
        </EmptyState>
      ) : (
        <div className="space-y-5">
          {missingSections.map((s) => (
            <section key={s.code}>
              <div className="mb-2 flex items-center gap-2">
                <Flag code={s.code} className="h-3.5 w-5" />
                <h2 className="font-display text-sm font-bold">{s.name}</h2>
                <span className="tabnum text-xs text-fg-muted">
                  {s.missing.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {s.missing.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => {
                      haptic('selection')
                      setCount.mutate({ stickerId: it.id, count: 1 })
                    }}
                    className="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold tabnum active:scale-95"
                  >
                    {it.country_code === 'FWC' ? it.sticker_code : it.slot_no}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="pointer-events-none fixed -left-[9999px] top-0">
        <ShareCard
          ref={cardRef}
          progress={progress}
          heading="Încă lipsă"
          lines={lines.slice(0, 12)}
          subtitle={`${progress.missing} abțibilduri căutate`}
        />
      </div>
    </div>
  )
}
