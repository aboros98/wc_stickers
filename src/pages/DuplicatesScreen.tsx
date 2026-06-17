import { useMemo, useRef, useState } from 'react'
import { Copy, Share2, Image as ImageIcon, Minus, Plus, Layers, ArrowLeftRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCollection, useSetCount } from '../data/useCollection'
import { exportText } from '../lib/collection'
import { shareText, copyText, shareImage } from '../lib/share'
import { haptic } from '../lib/haptics'
import { ShareCard } from '../components/ShareCard'
import { ActionButton } from '../components/ActionButton'
import { EmptyState } from '../components/EmptyState'
import { TileSkeleton } from '../components/TileSkeleton'
import { SectionLabel } from '../components/SectionLabel'

export function DuplicatesScreen() {
  const { sections, progress, isLoading } = useCollection()
  const setCount = useSetCount()
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  const dupeSections = useMemo(
    () =>
      sections
        .map((s) => ({ ...s, dupes: s.items.filter((i) => i.count >= 2) }))
        .filter((s) => s.dupes.length > 0),
    [sections],
  )

  const text = useMemo(
    () =>
      exportText(
        sections,
        (i) => i.count >= 2,
        (i) =>
          `${i.country_code === 'FWC' ? i.sticker_code : i.slot_no}×${i.count - 1}`,
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
          Dubluri
        </p>
        <div className="mt-1 flex items-end gap-2">
          <span className="font-display text-5xl font-black leading-none tabnum text-duplicate">
            {progress.duplicates}
          </span>
          <span className="pb-1 text-sm text-fg-muted">de schimbat</span>
        </div>
        <p className="mt-2 text-xs text-fg-muted">
          Abțibilduri pe care le poți da la schimb.
        </p>
      </section>

      <div className="mb-4 grid grid-cols-3 gap-2">
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
            shareText(text, 'Panini Cupa Mondială 2026 — dublurile mele')
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
              await shareImage(cardRef.current, 'Panini Cupa Mondială 2026 — dublurile mele')
            setBusy(false)
          }}
        >
          Imagine
        </ActionButton>
      </div>

      <Link
        to="/friends"
        className="mb-5 flex items-center justify-center gap-2 rounded-[12px] bg-turquoise/15 py-3 text-sm font-bold text-turquoise active:scale-[0.98]"
      >
        <ArrowLeftRight size={16} /> Schimbă cu prietenii
      </Link>

      {dupeSections.length === 0 ? (
        <EmptyState
          title="Încă nicio dublură"
          icon={<Layers size={32} className="text-fg-muted" />}
        >
          Atinge a doua oară un abțibild pe care îl ai deja, sau folosește
          Adăugare rapidă → Adaugă dublură. Dublurile apar aici pentru schimb.
        </EmptyState>
      ) : (
        <div className="space-y-5">
          {dupeSections.map((s) => (
            <section key={s.code}>
              <SectionLabel code={s.code} name={s.name} />
              <div className="space-y-2">
                {s.dupes.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between rounded-[12px] bg-surface-2 px-3 py-2"
                  >
                    <div className="font-display text-lg font-extrabold tabnum">
                      {it.sticker_code}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="O dublură mai puțin"
                        onClick={() =>
                          setCount.mutate({ stickerId: it.id, count: it.count - 1 })
                        }
                        className="grid h-8 w-8 place-items-center rounded-full bg-surface"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold tabnum text-duplicate">
                        +{it.count - 1}
                      </span>
                      <button
                        type="button"
                        aria-label="O dublură în plus"
                        onClick={() =>
                          setCount.mutate({ stickerId: it.id, count: it.count + 1 })
                        }
                        className="grid h-8 w-8 place-items-center rounded-full bg-primary text-black"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
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
          heading="Dubluri de schimbat"
          lines={lines.slice(0, 12)}
          subtitle={`${progress.duplicates} dubluri`}
        />
      </div>
    </div>
  )
}
