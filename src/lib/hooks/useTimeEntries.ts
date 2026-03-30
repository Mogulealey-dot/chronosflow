'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TimeEntry } from '@/types'

export function useTimeEntries(limit = 100) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('time_entries')
      .select('*, project:projects(id,name,color,is_billable)')
      .eq('is_running', false)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: false })
      .limit(limit)
    setEntries(data ?? [])
    setLoading(false)
  }, [limit]) // eslint-disable-line

  useEffect(() => {
    load()
  }, [load])

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('time-entries-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_entries' },
        () => load()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load]) // eslint-disable-line

  async function updateEntry(id: string, updates: Partial<TimeEntry>) {
    // Optimistic
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
    await supabase.from('time_entries').update(updates).eq('id', id)
  }

  async function deleteEntry(id: string) {
    // Optimistic
    setEntries((prev) => prev.filter((e) => e.id !== id))
    await supabase.from('time_entries').delete().eq('id', id)
  }

  async function bulkDelete(ids: string[]) {
    setEntries((prev) => prev.filter((e) => !ids.includes(e.id)))
    await supabase.from('time_entries').delete().in('id', ids)
  }

  return { entries, loading, updateEntry, deleteEntry, bulkDelete, refresh: load }
}
