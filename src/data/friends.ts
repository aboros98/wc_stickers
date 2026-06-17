import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import type { UserStickerRow } from '../lib/types'

export interface FriendProfile {
  id: string
  friend_code: string
  name: string
}

function toProfile(p: {
  id: string
  friend_code: string
  display_name: string | null
  username: string | null
}): FriendProfile {
  return {
    id: p.id,
    friend_code: p.friend_code,
    name: p.display_name || p.username || 'Prieten',
  }
}

/** The signed-in user's own profile (for their friend code). */
export function useMyProfile() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<FriendProfile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, friend_code, display_name, username')
        .eq('id', user!.id)
        .single()
      if (error || !data) return null
      return toProfile(data)
    },
  })
}

/** Resolve a friend code (e.g. "74E9D0D4") to a profile. */
export async function fetchProfileByCode(
  code: string,
): Promise<FriendProfile | null> {
  const c = code.trim().toUpperCase()
  if (!c) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id, friend_code, display_name, username')
    .eq('friend_code', c)
    .limit(1)
  if (error || !data || !data.length) return null
  return toProfile(data[0])
}

/** A friend's collection rows (read-allowed for signed-in users). */
export function useFriendStickers(friendId: string | null) {
  return useQuery({
    queryKey: ['friend_stickers', friendId],
    enabled: Boolean(friendId),
    // Auto-refresh so a friend's new stickers show up without reloading.
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
    staleTime: 8000,
    queryFn: async (): Promise<UserStickerRow[]> => {
      const { data, error } = await supabase
        .from('user_stickers')
        .select('*')
        .eq('user_id', friendId!)
      if (error) throw error
      return (data ?? []) as UserStickerRow[]
    },
  })
}
