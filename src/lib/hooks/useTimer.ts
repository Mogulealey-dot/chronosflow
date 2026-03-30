'use client'

import { useEffect, useRef } from 'react'
import { useTimerStore } from '@/lib/store/timer-store'
import { createClient } from '@/lib/supabase/client'
import type { TimeEntry } from '@/types'

export function useTimer() {
  const {
    timer,
    timerMode,
    pomodoroRunning,
    startTimer,
    stopTimer,
    tickTimer,
    tickPomodoro,
    setTimerFromDB,
  } = useTimerStore()

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const supabase = createClient()

  // Tick the active tracker timer
  useEffect(() => {
    if (timer.is_running) {
      intervalRef.current = setInterval(() => {
        tickTimer()
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timer.is_running, tickTimer])

  // Tick pomodoro
  useEffect(() => {
    if (timerMode === 'pomodoro' && pomodoroRunning) {
      const id = setInterval(tickPomodoro, 1000)
      return () => clearInterval(id)
    }
  }, [timerMode, pomodoroRunning, tickPomodoro])

  // Real-time sync: subscribe to active timer changes from other tabs
  useEffect(() => {
    const channel = supabase
      .channel('active-timer')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: 'is_running=eq.true',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const entry = payload.new as TimeEntry
            if (!timer.is_running) {
              const elapsed = Math.floor(
                (Date.now() - new Date(entry.start_time).getTime()) / 1000
              )
              setTimerFromDB({
                id: entry.id,
                project_id: entry.project_id,
                description: entry.description,
                is_billable: entry.is_billable,
                start_time: entry.start_time,
                elapsed,
                is_running: true,
              })
            }
          }
          if (payload.eventType === 'DELETE') {
            stopTimer()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleStart(
    description: string,
    projectId: string | null,
    isBillable: boolean
  ) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Optimistic update
    startTimer(description, projectId, isBillable)

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        description,
        project_id: projectId,
        is_billable: isBillable,
        start_time: new Date().toISOString(),
        is_running: true,
      })
      .select()
      .single()

    if (!error && data) {
      setTimerFromDB({ id: data.id })
    }
  }

  async function handleStop() {
    const { id, start_time, elapsed } = timer

    // Optimistic update
    stopTimer()

    if (!id || !start_time) return

    await supabase
      .from('time_entries')
      .update({
        end_time: new Date().toISOString(),
        duration: elapsed,
        is_running: false,
      })
      .eq('id', id)
  }

  return { timer, handleStart, handleStop }
}
