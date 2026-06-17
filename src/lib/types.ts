// Shared domain types for the Panini WC2026 tracker.

export type StickerType = 'regular' | 'foil' | 'special'
export type StickerSection = 'team' | 'special'

/** A row from the shared `catalog` table (one of the 980 stickers). */
export interface Sticker {
  id: number
  sticker_code: string // "ARG17", "FWC9", "00"
  country: string | null
  country_code: string // "ARG" / "FWC"
  slot_no: number // 1..20 within a team (0 for specials)
  type: StickerType
  section: StickerSection
  label: string | null
  page_no: number | null
  sort_order: number
  image_url: string | null
}

/** A row from `user_stickers`: the per-user count for a sticker. */
export interface UserStickerRow {
  user_id: string
  sticker_id: number
  count: number // 0 = missing, 1 = have, >=2 = have + (count-1) duplicates
  updated_at: string
}

/** A catalog sticker merged with the current user's count, for the UI. */
export interface CollectionItem extends Sticker {
  count: number
}

export type Status = 'missing' | 'have' | 'duplicate'

export function statusOf(count: number): Status {
  if (count <= 0) return 'missing'
  if (count === 1) return 'have'
  return 'duplicate'
}

/** All stickers for one country/section, with progress. */
export interface CountrySection {
  code: string
  name: string
  items: CollectionItem[]
  have: number
  total: number
}

export interface Progress {
  total: number
  have: number
  missing: number
  duplicates: number
  pct: number
}
