import { useEffect, useState, type CSSProperties } from 'react'

const PIECES = 28
const DEFAULT_COLORS = ['#3CAC3B', '#2A398D', '#E61D25', '#E1B530', '#FFFFFF']

interface Piece {
  id: string
  style: CSSProperties
}

/**
 * Dependency-free celebration burst. Bump `fireKey` to fire. Honors
 * prefers-reduced-motion (renders nothing). `colors` lets a section celebrate
 * in its national colors.
 */
export function ConfettiBurst({
  fireKey,
  colors = DEFAULT_COLORS,
}: {
  fireKey: number
  colors?: string[]
}) {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    if (!fireKey) return
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    const arr: Piece[] = Array.from({ length: PIECES }, (_, i) => {
      const dx = (Math.random() * 2 - 1) * 170
      const dy = 180 + Math.random() * 340
      const rot = Math.floor(Math.random() * 540) - 270
      const delay = Math.floor(Math.random() * 60)
      return {
        id: `${fireKey}-${i}`,
        style: {
          background: colors[i % colors.length],
          ['--dx' as string]: `${dx}px`,
          ['--dy' as string]: `${dy}px`,
          ['--rot' as string]: `${rot}deg`,
          animation: `confetti 1000ms cubic-bezier(.2,.6,.3,1) ${delay}ms forwards`,
        } as CSSProperties,
      }
    })
    setPieces(arr)
    const t = window.setTimeout(() => setPieces([]), 1200)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fireKey])

  if (!pieces.length) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] flex items-start justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative top-1/3">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="absolute h-2.5 w-2.5 rounded-[2px]"
            style={p.style}
          />
        ))}
      </div>
    </div>
  )
}
