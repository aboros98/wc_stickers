interface Props {
  value: number
  total: number
  className?: string
}

/** Slim emerald→gold completion bar (gold once full). */
export function ProgressBar({ value, total, className = '' }: Props) {
  const pct = total ? Math.min(100, (value / total) * 100) : 0
  const complete = total > 0 && value >= total
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-border ${className}`}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${pct}%`,
          background: complete ? 'var(--color-gold)' : 'var(--color-primary)',
        }}
      />
    </div>
  )
}
