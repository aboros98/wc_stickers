import type { CollectionItem } from './types'

export interface ParsedLine {
  code: string
  numbers: number[]
}

/** Parse "1, 2, 3", "1-5, 8", "1 2 3" (and "1 - 5") into a number list (0..99). */
function parseNums(s: string): number[] {
  const out = new Set<number>()
  const norm = s.replace(/\s*-\s*/g, '-') // glue ranges written with spaces
  for (const tok of norm.split(/[,\s]+/)) {
    const t = tok.trim()
    if (!t) continue
    const r = t.match(/^(\d+)-(\d+)$/)
    if (r) {
      let a = Number(r[1])
      let b = Number(r[2])
      if (a > b) [a, b] = [b, a]
      for (let n = a; n <= b; n++) if (n >= 0 && n <= 99) out.add(n)
    } else if (/^\d+$/.test(t)) {
      const n = Number(t)
      if (n >= 0 && n <= 99) out.add(n)
    }
  }
  return [...out].sort((x, y) => x - y)
}

/**
 * Parse multi-line text — one team per line: a 2-4 letter code, then numbers in
 * any common shape. All of these work (case-insensitive):
 *   "MEX - 1, 2, 3"  "MEX 1 2 3"  "MEX, 1, 2"  "ARG: 1-20"  "FWC1 2 3"
 */
export function parseAlbumText(text: string): ParsedLine[] {
  const out: ParsedLine[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    // code, then any mix of separators (space / - : . ,) before the numbers.
    const m = line.match(/^([A-Za-z]{2,4})[\s,:.\-]*(.+)$/)
    if (!m) continue
    const numbers = parseNums(m[2])
    if (numbers.length) out.push({ code: m[1].toUpperCase(), numbers })
  }
  return out
}

/**
 * Build shareable text lists (same format as the importer) for what you're
 * missing and your duplicates, e.g. "ARG - 3, 5\nFWC - 10". Round-trips through
 * parseAlbumText/buildImport.
 */
export function buildExport(items: CollectionItem[]): {
  missing: string
  doubles: string
} {
  const miss = new Map<string, number[]>()
  const dup = new Map<string, number[]>()
  const add = (map: Map<string, number[]>, code: string, n: number) => {
    const arr = map.get(code)
    if (arr) arr.push(n)
    else map.set(code, [n])
  }
  for (const it of items) {
    const n =
      it.country_code === 'FWC'
        ? Number(it.sticker_code.replace(/^FWC/, '')) || 0
        : it.slot_no
    if (it.count === 0) add(miss, it.country_code, n)
    else if (it.count >= 2) add(dup, it.country_code, n)
  }
  const fmt = (map: Map<string, number[]>) =>
    [...map.entries()]
      .map(
        ([code, nums]) =>
          `${code} - ${[...nums].sort((a, b) => a - b).join(', ')}`,
      )
      .join('\n')
  return { missing: fmt(miss), doubles: fmt(dup) }
}

export interface ImportResult {
  ops: { id: number; count: number }[]
  matched: number
  unknown: number
  /** Human-readable list of what didn't resolve, e.g. "MEX 19" or "MX — cod necunoscut". */
  unknownLabels: string[]
}

/**
 * Turn parsed "have" + "doubles" lines into upsert ops over the catalog.
 * Have → count ≥ 1; Doubles → count ≥ 2 (album copy + a spare). Never reduces.
 */
export function buildImport(
  items: CollectionItem[],
  haveLines: ParsedLine[],
  doubleLines: ParsedLine[],
): ImportResult {
  // Keys are uppercased on both sides so input codes are fully case-insensitive.
  const byCodeSlot = new Map<string, CollectionItem>()
  const byStickerCode = new Map<string, CollectionItem>()
  for (const it of items) {
    byStickerCode.set(it.sticker_code.toUpperCase(), it)
    byCodeSlot.set(`${it.country_code.toUpperCase()}#${it.slot_no}`, it)
  }

  const desired = new Map<number, number>()
  const base = (it: CollectionItem) =>
    desired.has(it.id) ? desired.get(it.id)! : it.count

  let matched = 0
  // code -> distinct numbers that failed to resolve (deduped across have + doubles)
  const missByCode = new Map<string, Set<number>>()
  const noteMiss = (code: string, n: number) => {
    let s = missByCode.get(code)
    if (!s) missByCode.set(code, (s = new Set()))
    s.add(n)
  }

  const resolve = (code: string, n: number): CollectionItem | undefined =>
    code === 'FWC'
      ? byStickerCode.get(n === 0 ? '00' : `FWC${n}`)
      : byCodeSlot.get(`${code}#${n}`)

  for (const line of haveLines)
    for (const n of line.numbers) {
      const it = resolve(line.code, n)
      if (!it) {
        noteMiss(line.code, n)
        continue
      }
      matched++
      desired.set(it.id, Math.max(base(it), 1))
    }

  for (const line of doubleLines)
    for (const n of line.numbers) {
      const it = resolve(line.code, n)
      if (!it) {
        noteMiss(line.code, n)
        continue
      }
      matched++
      desired.set(it.id, Math.max(base(it), 2))
    }

  // Build readable labels. If the country code itself is unknown, collapse to one
  // "cod necunoscut" line instead of listing every (meaningless) number under it.
  const knownCodes = new Set<string>(items.map((it) => it.country_code))
  knownCodes.add('FWC')
  const unknownLabels: string[] = []
  let unknown = 0
  for (const [code, nums] of missByCode) {
    unknown += nums.size
    if (!knownCodes.has(code)) {
      unknownLabels.push(`${code} — cod necunoscut`)
    } else {
      const sorted = [...nums].sort((a, b) => a - b)
      unknownLabels.push(`${code} ${sorted.join(', ')}`)
    }
  }
  unknownLabels.sort()

  return {
    ops: [...desired.entries()].map(([id, count]) => ({ id, count })),
    matched,
    unknown,
    unknownLabels,
  }
}
