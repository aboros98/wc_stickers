import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Sheet } from './Sheet'
import { Flag } from './Flag'
import { haptic } from '../lib/haptics'
import { parseAlbumText, buildImport } from '../lib/parseImport'
import { useBulkSetCount } from '../data/useCollection'
import type { CollectionItem } from '../lib/types'

interface Props {
  open: boolean
  onClose: () => void
  items: CollectionItem[]
}

/** Bulk import: paste "MEX - 1, 2, 3" lists into Have / Doubles → autocomplete. */
export function ImportSheet({ open, onClose, items }: Props) {
  const [have, setHave] = useState('')
  const [dbl, setDbl] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [showCodes, setShowCodes] = useState(false)
  const bulk = useBulkSetCount()

  // One row per country, in album order, for the in-sheet code reference.
  const teams = useMemo(() => {
    const seen = new Set<string>()
    const out: { code: string; name: string }[] = []
    for (const it of items) {
      if (seen.has(it.country_code)) continue
      seen.add(it.country_code)
      out.push({
        code: it.country_code,
        name:
          it.country ??
          (it.country_code === 'FWC' ? 'Speciale (sclipici)' : it.country_code),
      })
    }
    return out
  }, [items])

  const result = useMemo(
    () => buildImport(items, parseAlbumText(have), parseAlbumText(dbl)),
    [items, have, dbl],
  )

  const apply = () => {
    if (!result.ops.length) return
    setMsg(null)
    bulk.mutate(result.ops, {
      onSuccess: () => {
        haptic('success')
        setMsg(`${result.ops.length} abțibilduri actualizate.`)
        setHave('')
        setDbl('')
      },
      onError: () => setMsg('A apărut o eroare. Încearcă din nou.'),
    })
  }

  return (
    <Sheet open={open} onClose={onClose} title="Importă din text">
      <p className="mb-2 text-sm text-fg-muted">
        O linie per echipă, cu codul de 3 litere:{' '}
        <span className="text-fg">MEX - 1, 2, 3</span> sau{' '}
        <span className="text-fg">ARG: 1-20</span>. Pentru abțibildurile
        speciale (sclipici/logo): <span className="text-fg">FWC - 1, 2</span>.
      </p>

      <button
        type="button"
        onClick={() => setShowCodes((s) => !s)}
        className="mb-3 flex items-center gap-1 text-xs font-semibold text-turquoise-text active:opacity-70"
      >
        {showCodes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showCodes ? 'Ascunde codurile' : 'Nu știi codul? Vezi codurile echipelor'}
      </button>
      {showCodes && (
        <div className="mb-3 max-h-44 overflow-auto rounded-[12px] border border-border bg-surface-2 p-2.5">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {teams.map((t) => (
              <div key={t.code} className="flex items-center gap-1.5 text-xs">
                <Flag
                  code={t.code}
                  className="h-2.5 w-4 shrink-0 rounded-[2px] ring-1 ring-black/10"
                />
                <span className="truncate text-fg-muted">{t.name}</span>
                <span className="ml-auto font-bold tabnum text-fg">{t.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-fg-muted">
        Le am (în album)
      </label>
      <textarea
        value={have}
        onChange={(e) => setHave(e.target.value)}
        rows={4}
        placeholder={'MEX - 1, 2, 3\nARG - 1-20'}
        className="mb-3 w-full resize-none rounded-[12px] border border-border bg-surface-2 p-3 text-base outline-none focus:border-primary"
      />

      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-fg-muted">
        Dubluri (în plus)
      </label>
      <textarea
        value={dbl}
        onChange={(e) => setDbl(e.target.value)}
        rows={3}
        placeholder={'BRA - 5, 9\nESP - 11'}
        className="mb-3 w-full resize-none rounded-[12px] border border-border bg-surface-2 p-3 text-base outline-none focus:border-primary"
      />

      <div className="mb-3 flex justify-between text-xs">
        <span className="font-semibold text-primary-text">
          {result.ops.length} de actualizat
        </span>
        {result.unknown > 0 && (
          <span className="font-semibold text-danger">
            {result.unknown} necunoscute
          </span>
        )}
      </div>

      {result.unknownLabels.length > 0 && (
        <div className="mb-3 rounded-[12px] border border-danger/30 bg-danger/10 p-3">
          <p className="mb-2 text-xs font-bold text-danger">
            Nu am găsit:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.unknownLabels.map((l) => (
              <span
                key={l}
                className="rounded-full bg-danger/15 px-2.5 py-1 text-xs font-semibold text-danger"
              >
                {l}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-fg-muted">
            Verifică numărul — fiecare echipă are doar un anumit număr de
            abțibilduri — sau codul țării (3 litere, ex. MEX).
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={apply}
        disabled={!result.ops.length || bulk.isPending}
        className="w-full rounded-[12px] bg-primary py-3.5 font-bold text-black disabled:opacity-40"
      >
        {bulk.isPending ? 'Se aplică…' : `Aplică (${result.ops.length})`}
      </button>
      {msg && (
        <p
          role="status"
          className="mt-3 text-center text-sm font-semibold text-primary-text"
        >
          {msg}
        </p>
      )}
    </Sheet>
  )
}
