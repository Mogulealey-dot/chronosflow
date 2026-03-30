'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('projects')
        .select('*, client:clients(*)')
        .eq('is_archived', false)
        .order('name')
      setProjects(data ?? [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  async function createProject(
    name: string,
    color: string,
    clientId: string | null,
    hourlyRate: number | null,
    isBillable: boolean,
    budgetHours: number | null
  ) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, color, client_id: clientId, hourly_rate: hourlyRate, is_billable: isBillable, budget_hours: budgetHours })
      .select('*, client:clients(*)')
      .single()
    if (!error && data) setProjects((prev) => [...prev, data])
    return { data, error }
  }

  async function updateProject(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select('*, client:clients(*)')
      .single()
    if (!error && data)
      setProjects((prev) => prev.map((p) => (p.id === id ? data : p)))
    return { data, error }
  }

  async function deleteProject(id: string) {
    await supabase.from('projects').update({ is_archived: true }).eq('id', id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return { projects, loading, createProject, updateProject, deleteProject }
}
