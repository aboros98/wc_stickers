import type { CollectionItem } from './types'

// Compact, fully client-side swap codes. Each sticker is one of 3 states,
// packed into 2 bits, in the shared catalog's sort_order. 980 stickers ≈ 245
// bytes ≈ a short base64url string — small enough for a link and a QR code.

// 0 = missing, 1 = have (no spare), 2 = have + spare
function stateOf(count: number): number {
  if (count <= 0) return 0
  if (count === 1) return 1
  return 2
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

/** Encode the user's collection (ordered by sort_order) into a url-safe payload. */
export function encodeCollection(items: CollectionItem[]): string {
  const n = items.length
  const body = new Uint8Array(Math.ceil(n / 4))
  for (let i = 0; i < n; i++) {
    body[i >> 2] |= stateOf(items[i].count) << ((i & 3) * 2)
  }
  // 2-byte little-endian length header for a sanity check on decode
  const full = new Uint8Array(2 + body.length)
  full[0] = n & 0xff
  full[1] = (n >> 8) & 0xff
  full.set(body, 2)
  return bytesToB64url(full)
}

/** Decode a payload back into an array of states (0/1/2). null if malformed. */
export function decodeStates(payload: string): number[] | null {
  try {
    const full = b64urlToBytes(payload)
    if (full.length < 2) return null
    const n = full[0] | (full[1] << 8)
    if (n <= 0 || n > 4096) return null
    const body = full.subarray(2)
    const states: number[] = []
    for (let i = 0; i < n; i++) {
      const byte = body[i >> 2] ?? 0
      states.push((byte >> ((i & 3) * 2)) & 3)
    }
    return states
  } catch {
    return null
  }
}

export interface SwapMatch {
  give: CollectionItem[] // I have a spare AND they're missing it
  get: CollectionItem[] // they have a spare AND I'm missing it
}

/** Match my collection against a friend's decoded states (aligned by index). */
export function computeMatch(
  items: CollectionItem[],
  theirStates: number[],
): SwapMatch {
  const give: CollectionItem[] = []
  const get: CollectionItem[] = []
  const n = Math.min(items.length, theirStates.length)
  for (let i = 0; i < n; i++) {
    const mine = stateOf(items[i].count)
    const theirs = theirStates[i]
    if (mine === 2 && theirs === 0) give.push(items[i])
    if (theirs === 2 && mine === 0) get.push(items[i])
  }
  return { give, get }
}
