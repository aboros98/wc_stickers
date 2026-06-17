// Pure helpers that turn the raw catalog + user counts into UI-ready shapes.
// Kept dependency-free so they're trivially testable.

import type {
  Sticker,
  UserStickerRow,
  CollectionItem,
  CountrySection,
  Progress,
} from './types'

/** Merge the shared catalog with the user's counts into one list. */
export function mergeCollection(
  catalog: Sticker[],
  rows: UserStickerRow[],
): CollectionItem[] {
  const counts = new Map<number, number>()
  for (const r of rows) counts.set(r.sticker_id, r.count)
  return catalog.map((s) => ({ ...s, count: counts.get(s.id) ?? 0 }))
}

/** Group items into country/section blocks, ordered by album position. */
export function groupByCountry(items: CollectionItem[]): CountrySection[] {
  const map = new Map<string, CollectionItem[]>()
  for (const it of items) {
    const arr = map.get(it.country_code)
    if (arr) arr.push(it)
    else map.set(it.country_code, [it])
  }

  const sections: CountrySection[] = []
  for (const [code, arr] of map) {
    arr.sort(
      (a, b) =>
        a.slot_no - b.slot_no || a.sticker_code.localeCompare(b.sticker_code),
    )
    sections.push({
      code,
      name: arr[0]?.country ?? (code === 'FWC' ? 'Specials & Foils' : code),
      items: arr,
      have: arr.filter((i) => i.count >= 1).length,
      total: arr.length,
    })
  }

  sections.sort((a, b) => minSort(a.items) - minSort(b.items))
  return sections
}

function minSort(items: CollectionItem[]): number {
  let m = Number.POSITIVE_INFINITY
  for (const i of items) if (i.sort_order < m) m = i.sort_order
  return m
}

/** Overall completion numbers for the progress ring. */
export function overallProgress(items: CollectionItem[]): Progress {
  const total = items.length
  let have = 0
  let duplicates = 0
  for (const i of items) {
    if (i.count >= 1) have += 1
    if (i.count >= 2) duplicates += i.count - 1
  }
  return {
    total,
    have,
    missing: total - have,
    duplicates,
    pct: total ? Math.round((have / total) * 100) : 0,
  }
}

/** Compact, swap-friendly text export, e.g. "ARG: 3, 7, 12  |  BRA: 1, 5". */
export function exportText(
  sections: CountrySection[],
  pick: (i: CollectionItem) => boolean,
  render: (i: CollectionItem) => string,
): string {
  const lines: string[] = []
  for (const s of sections) {
    const chosen = s.items.filter(pick)
    if (chosen.length) lines.push(`${s.code}: ${chosen.map(render).join(', ')}`)
  }
  return lines.join('\n')
}
