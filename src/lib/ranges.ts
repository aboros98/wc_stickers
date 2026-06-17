/**
 * Parse a sticker-number entry like "1-18, 20, 5" into a sorted, de-duplicated
 * list of slot numbers within [1, max]. Tolerates spaces and reversed ranges.
 */
export function parseRanges(input: string, max = 20): number[] {
  const out = new Set<number>()
  for (const part of input.split(',')) {
    const p = part.trim()
    if (!p) continue
    const range = p.match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      let a = Number(range[1])
      let b = Number(range[2])
      if (a > b) [a, b] = [b, a]
      for (let n = a; n <= b; n++) if (n >= 1 && n <= max) out.add(n)
    } else if (/^\d+$/.test(p)) {
      const n = Number(p)
      if (n >= 1 && n <= max) out.add(n)
    }
  }
  return [...out].sort((x, y) => x - y)
}
