import { flagUrl } from '../lib/teamFlags'

interface Props {
  code: string
  className?: string
}

/** A real country flag (flagcdn). Specials (FWC) fall back to a gold square. */
export function Flag({ code, className = 'h-4 w-6' }: Props) {
  const url = flagUrl(code)
  if (!url) {
    return (
      <span
        className={`shrink-0 rounded-[3px] bg-gold ${className}`}
        aria-hidden="true"
      />
    )
  }
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      className={`shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-black/20 ${className}`}
    />
  )
}
