import { useMemo, useState } from 'react'
import { Sheet } from './Sheet'
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
  const bulk = useBulkSetCount()

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
      <p className="mb-3 text-sm text-fg-muted">
        O linie per echipă, cu codul:{' '}
        <span className="text-fg">MEX - 1, 2, 3</span> sau{' '}
        <span className="text-fg">ARG: 1-20</span>. Pentru speciale:{' '}
        <span className="text-fg">FWC - 1, 2</span>.
      </p>

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
        <span className="font-semibold text-primary">
          {result.ops.length} de actualizat
        </span>
        {result.unknown > 0 && (
          <span className="font-semibold text-danger">
            {result.unknown} necunoscute
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={apply}
        disabled={!result.ops.length || bulk.isPending}
        className="w-full rounded-[12px] bg-primary py-3.5 font-bold text-black disabled:opacity-40"
      >
        {bulk.isPending ? 'Se aplică…' : `Aplică (${result.ops.length})`}
      </button>
      {msg && (
        <p className="mt-3 text-center text-sm font-semibold text-primary">{msg}</p>
      )}
    </Sheet>
  )
}
