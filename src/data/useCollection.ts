import { useMemo } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import type { Sticker, UserStickerRow } from '../lib/types'
import {
  groupByCountry,
  mergeCollection,
  overallProgress,
} from '../lib/collection'

async function fetchCatalog(): Promise<Sticker[]> {
  const { data, error } = await supabase
    .from('catalog')
    .select('*')
    .order('sort_order', { ascending: true })
    .limit(2000)
  if (error) throw error
  return (data ?? []) as Sticker[]
}

async function fetchUserStickers(userId: string): Promise<UserStickerRow[]> {
  const { data, error } = await supabase
    .from('user_stickers')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as UserStickerRow[]
}

/** The shared catalog is effectively static, so cache it hard. */
export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: fetchCatalog,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

/** The full merged collection + grouped sections + overall progress. */
export function useCollection() {
  const { user } = useAuth()
  const catalog = useCatalog()
  const userStickers = useQuery({
    queryKey: ['user_stickers', user?.id],
    queryFn: () => fetchUserStickers(user!.id),
    enabled: Boolean(user),
  })

  const items = useMemo(
    () =>
      catalog.data && userStickers.data
        ? mergeCollection(catalog.data, userStickers.data)
        : [],
    [catalog.data, userStickers.data],
  )
  const sections = useMemo(() => groupByCountry(items), [items])
  const progress = useMemo(() => overallProgress(items), [items])

  return {
    isLoading: catalog.isLoading || (Boolean(user) && userStickers.isLoading),
    error: catalog.error ?? userStickers.error,
    refetch: () => {
      catalog.refetch()
      userStickers.refetch()
    },
    items,
    sections,
    progress,
  }
}

interface SetCountVars {
  stickerId: number
  count: number
}

/** Upsert a sticker's count with an optimistic update for instant feedback. */
export function useSetCount() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const key = ['user_stickers', user?.id]

  return useMutation({
    mutationFn: async ({ stickerId, count }: SetCountVars) => {
      if (!user) throw new Error('Not signed in')
      const c = Math.max(0, count)
      const { error } = await supabase
        .from('user_stickers')
        .upsert(
          { user_id: user.id, sticker_id: stickerId, count: c },
          { onConflict: 'user_id,sticker_id' },
        )
      if (error) throw error
      return { stickerId, count: c }
    },
    onMutate: async ({ stickerId, count }) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<UserStickerRow[]>(key)
      const c = Math.max(0, count)
      qc.setQueryData<UserStickerRow[]>(key, (old) => {
        const rows = old ? [...old] : []
        const idx = rows.findIndex((r) => r.sticker_id === stickerId)
        if (idx >= 0) {
          rows[idx] = { ...rows[idx], count: c }
        } else if (user) {
          rows.push({
            user_id: user.id,
            sticker_id: stickerId,
            count: c,
            updated_at: new Date().toISOString(),
          })
        }
        return rows
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key })
    },
  })
}

/** Upsert many counts in one go (text import + trades) with optimistic update. */
export function useBulkSetCount() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const key = ['user_stickers', user?.id]

  return useMutation({
    mutationFn: async (ops: { id: number; count: number }[]) => {
      if (!user || !ops.length) return
      const rows = ops.map((o) => ({
        user_id: user.id,
        sticker_id: o.id,
        count: Math.max(0, o.count),
      }))
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase
          .from('user_stickers')
          .upsert(rows.slice(i, i + 500), { onConflict: 'user_id,sticker_id' })
        if (error) throw error
      }
    },
    onMutate: async (ops) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<UserStickerRow[]>(key)
      qc.setQueryData<UserStickerRow[]>(key, (old) => {
        const rows = old ? [...old] : []
        for (const o of ops) {
          const c = Math.max(0, o.count)
          const idx = rows.findIndex((r) => r.sticker_id === o.id)
          if (idx >= 0) rows[idx] = { ...rows[idx], count: c }
          else if (user)
            rows.push({
              user_id: user.id,
              sticker_id: o.id,
              count: c,
              updated_at: new Date().toISOString(),
            })
        }
        return rows
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key })
    },
  })
}
