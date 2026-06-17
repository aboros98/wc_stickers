// Friends you've removed locally (so they stay hidden even if they added you).

const KEY = 'wc26-hidden-friends'

export function getHidden(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function hideFriend(id: string): void {
  try {
    const s = new Set(getHidden())
    s.add(id)
    localStorage.setItem(KEY, JSON.stringify([...s]))
  } catch {
    /* ignore */
  }
}

export function unhideFriend(id: string): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(getHidden().filter((x) => x !== id)),
    )
  } catch {
    /* ignore */
  }
}
