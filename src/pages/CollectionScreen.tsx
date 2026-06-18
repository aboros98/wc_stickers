import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Search, LogOut, X, ClipboardPaste } from 'lucide-react'
import { useCollection, useSetCount } from '../data/useCollection'
import { ProgressRing } from '../components/ProgressRing'
import { FilterChip } from '../components/FilterChip'
import { SectionAccordion } from '../components/SectionAccordion'
import { StickerActionSheet } from '../components/StickerActionSheet'
import { QuickAddSheet } from '../components/QuickAddSheet'
import { TileSkeleton } from '../components/TileSkeleton'
import { EmptyState } from '../components/EmptyState'
import { ThemeToggle } from '../components/ThemeToggle'
import { ConfettiBurst } from '../components/ConfettiBurst'
import { ImportSheet } from '../components/ImportSheet'
import { useAuth } from '../auth/AuthProvider'
import wc26 from '../assets/wc2026.webp'

type Filter = 'all' | 'missing' | 'spares' | 'complete'

const INTRO_KEY = 'wc26-seenIntro'

export function CollectionScreen() {
  const { items, sections, progress, isLoading } = useCollection()
  const setCount = useSetCount()
  const { signOut } = useAuth()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [actionId, setActionId] = useState<number | null>(null)
  const [quickAdd, setQuickAdd] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [seenIntro, setSeenIntro] = useState(() => {
    try {
      return localStorage.getItem(INTRO_KEY) === '1'
    } catch {
      return false
    }
  })
  const [confetti, setConfetti] = useState(0)
  const prevRef = useRef({ have: 0, complete: 0, init: false })

  const completeCount = useMemo(
    () => sections.filter((s) => s.total > 0 && s.have === s.total).length,
    [sections],
  )

  const pct = progress.total
    ? Math.round((progress.have / progress.total) * 100)
    : 0
  const albumComplete = progress.total > 0 && progress.have >= progress.total
  const cheer =
    progress.have === 0
      ? 'Deschide primul pachet!'
      : albumComplete
        ? 'Album complet! 🎉'
        : pct >= 75
          ? 'Aproape gata!'
          : pct >= 50
            ? 'Peste jumătate!'
            : pct >= 25
              ? 'Prinde viteză 🔥'
              : 'Bun început!'

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let secs = sections
    if (q) {
      secs = secs.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
      )
    }
    secs = secs.map((s) => {
      let items = s.items
      if (filter === 'missing') items = items.filter((i) => i.count === 0)
      else if (filter === 'spares') items = items.filter((i) => i.count >= 2)
      return { ...s, items }
    })
    if (filter === 'missing' || filter === 'spares') {
      secs = secs.filter((s) => s.items.length > 0)
    } else if (filter === 'complete') {
      secs = secs.filter((s) => s.total > 0 && s.have === s.total)
    }
    return secs
  }, [sections, query, filter])

  const setCountFn = (stickerId: number, count: number) =>
    setCount.mutate({ stickerId, count })

  // Re-derive the edited sticker from the live list so the action sheet's count
  // and its steppers reflect each change instead of a stale snapshot.
  const actionItem =
    actionId == null ? null : (items.find((i) => i.id === actionId) ?? null)

  const firstRun = progress.have === 0 && filter === 'all' && !query.trim()
  const autoOpen = filter !== 'all' || query.trim().length > 0

  useEffect(() => {
    if (isLoading) return
    const prev = prevRef.current
    if (prev.init) {
      const albumDone =
        progress.total > 0 &&
        progress.have === progress.total &&
        prev.have < progress.total
      if (albumDone || completeCount > prev.complete) setConfetti((k) => k + 1)
    }
    prevRef.current = { have: progress.have, complete: completeCount, init: true }
  }, [progress.have, progress.total, completeCount, isLoading])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [query, filter])

  const dismissIntro = () => {
    try {
      localStorage.setItem(INTRO_KEY, '1')
    } catch {
      /* ignore */
    }
    setSeenIntro(true)
  }

  if (isLoading) {
    return (
      <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <TileSkeleton className="mb-3 h-40 w-full rounded-[20px]" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <TileSkeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      {/* WC2026 hero */}
      <section className="anim-fade-up relative mb-3 overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-surface-2 to-surface p-4">
        <div className="anim-float pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-gold/20 blur-2xl" />
        <img
          src={wc26}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-3 h-24 w-auto opacity-[0.12]"
        />
        <div className="relative flex items-start justify-between">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            Cupa Mondială 2026
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              aria-label="Importă din text"
              className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-fg-muted"
            >
              <ClipboardPaste size={16} />
            </button>
            <ThemeToggle />
            <button
              type="button"
              onClick={signOut}
              aria-label="Deconectare"
              className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-fg-muted"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-4">
          <ProgressRing value={progress.have} total={progress.total} size={104} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-extrabold leading-tight">
              Albumul tău
            </h1>
            <p
              className={`mt-1 text-sm font-bold ${albumComplete ? 'text-gold' : 'text-primary'}`}
            >
              {cheer}
            </p>
            <p className="mt-0.5 text-xs text-fg-muted">
              {completeCount} echipe complete · {progress.duplicates} dubluri
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-out ${albumComplete ? 'bg-gold' : 'bg-primary'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] font-semibold">
            <span className="text-primary">{progress.have} colectate</span>
            <span className="text-fg-muted">{progress.missing} rămase</span>
          </div>
        </div>
      </section>

      {/* Sticky search + filters */}
      <div className="sticky top-0 z-30 -mx-4 mb-3 bg-background/85 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="flex items-center gap-2 rounded-full bg-surface-2 px-4">
          <Search size={16} className="text-fg-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută o echipă…"
            autoCapitalize="off"
            autoCorrect="off"
            enterKeyHint="search"
            className="h-11 flex-1 bg-transparent text-base outline-none placeholder:text-fg-muted"
          />
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            Toate
          </FilterChip>
          <FilterChip
            active={filter === 'missing'}
            onClick={() => setFilter('missing')}
            count={progress.missing}
          >
            Lipsă
          </FilterChip>
          <FilterChip
            active={filter === 'spares'}
            onClick={() => setFilter('spares')}
            count={progress.duplicates}
          >
            Dubluri
          </FilterChip>
          <FilterChip
            active={filter === 'complete'}
            onClick={() => setFilter('complete')}
            count={completeCount}
          >
            Complete
          </FilterChip>
        </div>
      </div>

      {firstRun && (
        <div className="mb-3 rounded-[16px] bg-surface-2 p-4 text-center">
          <h2 className="font-display text-lg font-bold">Începe albumul</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Tocmai ai deschis un pachet? Adaugă rapid abțibilduri sau atinge
            orice slot de mai jos.
          </p>
          <button
            type="button"
            onClick={() => setQuickAdd(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 font-semibold text-black active:scale-95"
          >
            <Plus size={18} /> Adaugă primele abțibilduri
          </button>
        </div>
      )}

      {!seenIntro && (
        <div className="mb-3 flex items-start gap-3 rounded-[12px] border border-border bg-surface px-3 py-2.5">
          <p className="flex-1 text-xs leading-relaxed text-fg-muted">
            <span className="font-semibold text-fg">Atinge</span> un slot gol ca
            să-l colectezi. <span className="font-semibold text-fg">Atinge unul
            colectat</span> ca să adaugi dubluri sau să resetezi.
          </p>
          <button
            type="button"
            onClick={dismissIntro}
            aria-label="Închide sfatul"
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-fg-muted"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState title="Nimic aici">
          Încearcă alt filtru sau altă căutare.
        </EmptyState>
      ) : (
        <div className="space-y-2">
          {visible.map((s, idx) => (
            <SectionAccordion
              key={`${s.code}-${filter}-${query ? 'q' : ''}`}
              section={s}
              defaultOpen={autoOpen || (firstRun && idx === 0)}
              onSetCount={setCountFn}
              onLongPress={(it) => setActionId(it.id)}
            />
          ))}
        </div>
      )}

      <StickerActionSheet
        item={actionItem}
        onClose={() => setActionId(null)}
        onSetCount={setCountFn}
      />
      <QuickAddSheet
        open={quickAdd}
        onClose={() => setQuickAdd(false)}
        sections={sections}
        onSetCount={setCountFn}
      />
      <ImportSheet
        open={importOpen}
        onClose={() => setImportOpen(false)}
        items={items}
      />
      <ConfettiBurst fireKey={confetti} />
    </div>
  )
}
