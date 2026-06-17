import { Flag } from './Flag'

interface Props {
  code: string
  name: string
  count?: number
}

/** Consistent team/section label (flag + name + optional count) used across pages. */
export function SectionLabel({ code, name, count }: Props) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <Flag code={code} className="h-3.5 w-5" />
      <h2 className="font-display text-sm font-bold">{name}</h2>
      {typeof count === 'number' && (
        <span className="tabnum text-xs text-fg-muted">{count}</span>
      )}
    </div>
  )
}
