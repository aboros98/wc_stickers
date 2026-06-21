import { useCallback, useState } from 'react'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { getHidden, unhideFriend } from '../lib/friends'

export interface FriendProfile {
  id: string
  friend_code: string
  name: string
  avatar?: string | null
}

const SELECT = 'id, friend_code, display_name, username, avatar_url'

interface ProfileRow {
  id: string
  friend_code: string
  display_name: string | null
  username: string | null
  avatar_url: string | null
}

function toProfile(p: ProfileRow): FriendProfile {
  return {
    id: p.id,
    friend_code: p.friend_code,
    name: p.display_name || p.username || 'Prieten',
    avatar: p.avatar_url,
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
        .select(SELECT)
        .eq('id', user!.id)
        .single()
      if (error || !data) return null
      return toProfile(data as ProfileRow)
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
    .select(SELECT)
    .eq('friend_code', c)
    .limit(1)
  if (error) throw error // network/RLS failure — let the caller report it, not "not found"
  if (!data || !data.length) return null
  return toProfile(data[0] as ProfileRow)
}

export interface FriendStickerRow {
  user_id: string
  sticker_id: number
  count: number
}

const PAGE = 1000

/**
 * All friends' OWNED stickers (count ≥ 1), PAGINATED. Each collector owns up to
 * ~980 rows, so several friends easily exceed PostgREST's 1000-row cap; without
 * paging the response is silently truncated and some friends look empty (and two
 * users see different/asymmetric trade numbers). We loop .range() until drained.
 */
export function useFriendsStickers(ids: string[]) {
  return useQuery({
    queryKey: ['friends_stickers', [...ids].sort().join(',')],
    enabled: ids.length > 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    // Keep showing the prior batch while the key changes (friend added/removed)
    // so cards don't flash empty during the refetch.
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<FriendStickerRow[]> => {
      const all: FriendStickerRow[] = []
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase
          .from('user_stickers')
          .select('user_id, sticker_id, count')
          .in('user_id', ids)
          .gte('count', 1)
          .order('user_id', { ascending: true })
          .order('sticker_id', { ascending: true })
          .range(from, from + PAGE - 1)
        if (error) throw error
        const batch = (data ?? []) as FriendStickerRow[]
        all.push(...batch)
        if (batch.length < PAGE) break
      }
      return all
    },
  })
}

/** Everyone linked to me (either direction) — so adding is mutual. */
export function useFriends() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['friends', user?.id],
    enabled: Boolean(user),
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    queryFn: async (): Promise<FriendProfile[]> => {
      const { data: links } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${user!.id},friend_id.eq.${user!.id}`)
      const ids = new Set<string>()
      for (const l of links ?? [])
        ids.add(l.user_id === user!.id ? l.friend_id : l.user_id)
      const hidden = new Set(getHidden())
      const want = [...ids].filter((id) => id !== user!.id && !hidden.has(id))
      if (!want.length) return []
      // Chunk the id list so a large friend list never hits the 1000-row cap.
      const profs: ProfileRow[] = []
      for (let i = 0; i < want.length; i += PAGE) {
        const { data, error } = await supabase
          .from('profiles')
          .select(SELECT)
          .in('id', want.slice(i, i + PAGE))
        if (error) throw error
        profs.push(...((data ?? []) as ProfileRow[]))
      }
      return profs.map(toProfile)
    },
  })
}

export async function addFriendship(friendId: string) {
  const { data } = await supabase.auth.getUser()
  const uid = data.user?.id
  if (!uid || uid === friendId) return
  const { error } = await supabase
    .from('friendships')
    .upsert({ user_id: uid, friend_id: friendId }, { onConflict: 'user_id,friend_id' })
  if (error) throw error
}

/** Returns true if the server delete succeeded (so the caller can roll back on failure). */
export async function removeFriendship(friendId: string): Promise<boolean> {
  const { data } = await supabase.auth.getUser()
  const uid = data.user?.id
  if (!uid) return false
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('user_id', uid)
    .eq('friend_id', friendId)
  return !error
}

export interface TradeRow {
  id: string
  from_user: string
  to_user: string
  give_ids: number[]
  take_ids: number[]
  status: string
  created_at: string
  resolved_at?: string | null
}

/** Pending trades I'm part of (incoming + outgoing), auto-refreshed. */
export function useTrades() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['trades', user?.id],
    enabled: Boolean(user),
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
    staleTime: 8000,
    queryFn: async (): Promise<TradeRow[]> => {
      const { data, error } = await supabase
        .from('trades')
        .select('id, from_user, to_user, give_ids, take_ids, status, created_at')
        .eq('status', 'pending')
        .or(`from_user.eq.${user!.id},to_user.eq.${user!.id}`)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as TradeRow[]
    },
  })
}

/** Resolved trades (accepted/declined) I'm part of, both directions — for history. */
export function useTradeHistory() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['trade_history', user?.id],
    enabled: Boolean(user),
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<TradeRow[]> => {
      const { data, error } = await supabase
        .from('trades')
        .select(
          'id, from_user, to_user, give_ids, take_ids, status, created_at, resolved_at',
        )
        .neq('status', 'pending')
        .or(`from_user.eq.${user!.id},to_user.eq.${user!.id}`)
        .order('resolved_at', { ascending: false })
        .limit(40)
      if (error) throw error
      return (data ?? []) as TradeRow[]
    },
  })
}

/** Propose a trade to a friend (give = stickers I give them, take = I take from them). */
export async function proposeTrade(
  toUser: string,
  giveIds: number[],
  takeIds: number[],
) {
  const { data } = await supabase.auth.getUser()
  const uid = data.user?.id
  if (!uid) throw new Error('Not signed in')
  const { error } = await supabase.from('trades').insert({
    from_user: uid,
    to_user: toUser,
    give_ids: giveIds,
    take_ids: takeIds,
  })
  if (error) throw error
}

/** Recipient accepts — both albums update atomically (server-side). */
export async function acceptTrade(id: string) {
  const { error } = await supabase.rpc('accept_trade', { p_id: id })
  if (error) throw error
}

/** Either party declines/cancels a pending trade. */
export async function cancelTrade(id: string) {
  const { error } = await supabase.rpc('cancel_trade', { p_id: id })
  if (error) throw error
}

/**
 * Shared "add a friend" flow: accepts a raw code or a share link/hash
 * (e.g. "...#add=74E9D0D4"), links mutually, and reports a status message.
 * Returns the user's own profile too, for showing their code/QR.
 */
export function useAddFriend() {
  const qc = useQueryClient()
  const myProfile = useMyProfile()
  const myCode = myProfile.data?.friend_code ?? ''
  const [msg, setMsg] = useState<string | null>(null)
  const [msgKind, setMsgKind] = useState<'ok' | 'err'>('ok')

  const doAdd = useCallback(
    async (raw: string): Promise<boolean> => {
      const m = raw.match(/add=([A-Za-z0-9]+)/)
      const code = (m ? m[1] : raw).trim().toUpperCase()
      if (!code) return false
      if (myCode && code === myCode) {
        setMsg('Acesta e codul tău.')
        setMsgKind('err')
        return false
      }
      try {
        const p = await fetchProfileByCode(code)
        if (!p) {
          setMsg(
            'Nu am găsit acest cod. Verifică-l sau cere-i prietenului să-și deschidă contul mai întâi.',
          )
          setMsgKind('err')
          return false
        }
        unhideFriend(p.id)
        await addFriendship(p.id)
        qc.invalidateQueries({ queryKey: ['friends'] })
        setMsg(`${p.name} adăugat!`)
        setMsgKind('ok')
        return true
      } catch {
        setMsg('Eroare de rețea. Încearcă din nou.')
        setMsgKind('err')
        return false
      }
    },
    [myCode, qc],
  )

  return { doAdd, msg, msgKind, setMsg, myProfile }
}
