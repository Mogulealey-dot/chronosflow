'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ProjectEfficiency {
  project_id: string
  project_name: string
  project_color: string
  estimated_hours: number
  actual_hours: number
  efficiency_ratio: number
  status: 'Healthy' | 'Warning' | 'Over Budget' | 'No Budget'
}

export function useProjectAnalytics() {
  const [data, setData] = useState<ProjectEfficiency[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: result } = await supabase.rpc('get_project_efficiency', {
      input_user_id: user.id,
    })

    setData(result ?? [])
    setLoading(false)
  }, []) // eslint-disable-line

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, refetch: fetch }
}
