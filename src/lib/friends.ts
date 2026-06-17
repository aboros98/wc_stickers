// A friend the user has added, stored locally (per device).

export interface SavedFriend {
  id: string
  code: string
  name: string
}

const KEY = 'wc26-friends'

export function getFriends(): SavedFriend[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function save(list: SavedFriend[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

export function addFriend(f: SavedFriend): SavedFriend[] {
  const list = getFriends().filter((x) => x.id !== f.id)
  list.push(f)
  save(list)
  return list
}

export function removeFriend(id: string): SavedFriend[] {
  const list = getFriends().filter((x) => x.id !== id)
  save(list)
  return list
}
