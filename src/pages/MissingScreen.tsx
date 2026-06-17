import { useMemo, useRef, useState } from 'react'
import { Copy, Share2, Image as ImageIcon, Trophy } from 'lucide-react'
import { useCollection, useSetCount } from '../data/useCollection'
import { exportText } from '../lib/collection'
import { shareText, copyText, shareImage } from '../lib/share'
import { haptic } from '../lib/haptics'
import { ShareCard } from '../components/ShareCard'
import { ActionButton } from '../components/ActionButton'
import { ProgressBar } from '../components/ProgressBar'
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
        <TileSkeleton className="h-28 w-full rounded-[20px]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <TileSkeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="anim-fade-up px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <section className="mb-4 overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-surface-2 to-surface p-4">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-fg-muted">
          Îți lipsesc
        </p>
        <div className="mt-1 flex items-end gap-2">
          <span className="font-display text-5xl font-black leading-none tabnum">
            {progress.missing}
          </span>
          <span className="pb-1 text-sm text-fg-muted">din {progress.total}</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={progress.have} total={progress.total} />
        </div>
        <p className="mt-2 text-xs text-fg-muted">
          Atinge un număr pe care l-ai găsit ca să-l colectezi.
        </p>
      </section>

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
          onClick={() =>
            shareText(text, 'Panini Cupa Mondială 2026 — abțibilduri căutate')
          }
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
                    className="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold tabnum ring-1 ring-border transition active:scale-90"
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
