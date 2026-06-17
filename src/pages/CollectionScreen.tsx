import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Search, LogOut, X } from 'lucide-react'
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
import { useAuth } from '../auth/AuthProvider'
import type { CollectionItem } from '../lib/types'

type Filter = 'all' | 'missing' | 'spares' | 'complete'

const INTRO_KEY = 'wc26-seenIntro'

export function CollectionScreen() {
  const { sections, progress, isLoading } = useCollection()
  const setCount = useSetCount()
  const { signOut } = useAuth()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [actionItem, setActionItem] = useState<CollectionItem | null>(null)
  const [quickAdd, setQuickAdd] = useState(false)
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
      <div className="px-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="mb-6 flex items-center gap-4">
          <TileSkeleton className="h-[92px] w-[92px] rounded-full" />
          <div className="flex-1 space-y-2">
            <TileSkeleton className="h-5 w-2/3" />
            <TileSkeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <TileSkeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-1">
      <header className="sticky top-0 z-30 -mx-4 mb-3 bg-background/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="flex items-center gap-4">
          <ProgressRing value={progress.have} total={progress.total} />
          <div className="flex-1">
            <h1 className="font-display text-xl font-extrabold leading-tight">
              Albumul tău
            </h1>
            <p className="text-sm text-fg-muted">
              {completeCount} echipe complete · {progress.duplicates} dubluri
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        <div className="mt-3 flex items-center gap-2 rounded-[12px] bg-surface-2 px-3">
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

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
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
      </header>

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
            <span className="font-semibold text-fg">Atinge</span> un slot ca să-l
            marchezi „Am”. <span className="font-semibold text-fg">Atinge din
            nou</span> pentru o dublură. <span className="font-semibold text-fg">
            Ține apăsat</span> ca să editezi sau resetezi.
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
              onLongPress={setActionItem}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setQuickAdd(true)}
        aria-label="Adăugare rapidă"
        className="fixed bottom-20 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-gold text-black shadow-xl active:scale-95"
      >
        <Plus size={26} />
      </button>

      <StickerActionSheet
        item={actionItem}
        onClose={() => setActionItem(null)}
        onSetCount={setCountFn}
      />
      <QuickAddSheet
        open={quickAdd}
        onClose={() => setQuickAdd(false)}
        sections={sections}
        onSetCount={setCountFn}
      />
      <ConfettiBurst fireKey={confetti} />
    </div>
  )
}
