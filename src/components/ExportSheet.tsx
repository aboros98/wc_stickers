import { useMemo, useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { Sheet } from './Sheet'
import { buildExport } from '../lib/parseImport'
import { copyText, shareText } from '../lib/share'
import { haptic } from '../lib/haptics'
import type { CollectionItem } from '../lib/types'

function ExportBlock({
  title,
  text,
  shareTitle,
  copied,
  onCopy,
}: {
  title: string
  text: string
  shareTitle: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <section className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold">{title}</h3>
        {text && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1.5 text-xs font-bold active:scale-95"
            >
              {copied ? (
                <Check size={13} className="text-primary-text" />
              ) : (
                <Copy size={13} />
              )}
              {copied ? 'Copiat' : 'Copiază'}
            </button>
            <button
              type="button"
              onClick={() => shareText(text, shareTitle)}
              aria-label={`Distribuie: ${title}`}
              className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 active:scale-95"
            >
              <Share2 size={14} />
            </button>
          </div>
        )}
      </div>
      {text ? (
        <pre className="max-h-44 overflow-auto whitespace-pre-wrap break-words rounded-[12px] bg-surface-2 p-3 text-xs leading-relaxed tabnum">
          {text}
        </pre>
      ) : (
        <p className="text-sm text-fg-muted">Nimic aici încă.</p>
      )}
    </section>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  items: CollectionItem[]
}

/** Export your missing + duplicate lists as shareable, import-compatible text. */
export function ExportSheet({ open, onClose, items }: Props) {
  const { missing, doubles } = useMemo(() => buildExport(items), [items])
  const [copied, setCopied] = useState<'miss' | 'dup' | null>(null)

  const copy = async (key: 'miss' | 'dup', text: string) => {
    if (await copyText(text)) {
      haptic('success')
      setCopied(key)
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Exportă lista">
      <p className="mb-3 text-sm text-fg-muted">
        Copiază sau distribuie listele tale. Le poate citi oricine — sau le poate
        importa direct în aplicație.
      </p>
      <ExportBlock
        title="Îmi lipsesc"
        text={missing}
        shareTitle="Abțibilduri care îmi lipsesc (Panini WC2026)"
        copied={copied === 'miss'}
        onCopy={() => copy('miss', missing)}
      />
      <ExportBlock
        title="Dubluri (de dat)"
        text={doubles}
        shareTitle="Dublurile mele (Panini WC2026)"
        copied={copied === 'dup'}
        onCopy={() => copy('dup', doubles)}
      />
    </Sheet>
  )
}
