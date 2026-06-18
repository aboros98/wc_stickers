interface Props {
  value: number
  total: number
  size?: number
  stroke?: number
}

/** Animated SVG completion ring with center percentage + count. */
export function ProgressRing({ value, total, size = 92, stroke = 8 }: Props) {
  const pct = total ? value / total : 0
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct)
  const complete = total > 0 && value >= total
  const color = complete ? 'var(--color-gold)' : 'var(--color-primary)'

  return (
    <div
      className="relative grid place-items-center"
      role="img"
      aria-label={`${value} din ${total} colectate, ${Math.round(pct * 100)}%`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center leading-none"
        aria-hidden="true"
      >
        <span className="font-display text-lg font-extrabold tabnum">
          {Math.round(pct * 100)}%
        </span>
        <span className="mt-0.5 text-[10px] text-fg-muted tabnum">
          {value}/{total}
        </span>
      </div>
    </div>
  )
}
