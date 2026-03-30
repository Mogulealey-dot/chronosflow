'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTimeEntries } from '@/lib/hooks/useTimeEntries'
import { useTimerStore } from '@/lib/store/timer-store'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ProjectDonut } from '@/components/dashboard/ProjectDonut'
import { WeeklyBarChart } from '@/components/dashboard/WeeklyBarChart'
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap'
import { PomodoroTimer } from '@/components/timer/PomodoroTimer'
import { calcEfficiencyRatio, formatDuration } from '@/lib/utils/format'
import type { ProjectStats } from '@/types'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function DashboardPage() {
  const { entries } = useTimeEntries(500)
  const { deepWorkActive, timerMode, setTimerMode } = useTimerStore()

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const stats = useMemo(() => {
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    let todaySeconds = 0
    let weekSeconds = 0
    let monthSeconds = 0
    let estimatedTotal = 0
    let actualTotal = 0

    entries.forEach((e) => {
      const d = e.duration ?? 0
      const date = new Date(e.start_time)
      if (e.start_time.startsWith(todayStr)) todaySeconds += d
      if (date >= startOfWeek) weekSeconds += d
      if (date >= startOfMonth) monthSeconds += d
      if (e.estimated_seconds) {
        estimatedTotal += e.estimated_seconds
        actualTotal += d
      }
    })

    return {
      todaySeconds,
      weekSeconds,
      monthSeconds,
      efficiencyRatio: calcEfficiencyRatio(estimatedTotal, actualTotal),
    }
  }, [entries, todayStr])

  // Project breakdown (last 30 days)
  const projectStats: ProjectStats[] = useMemo(() => {
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - 30)
    const map: Record<string, ProjectStats> = {}

    entries
      .filter((e) => new Date(e.start_time) >= cutoff && e.project)
      .forEach((e) => {
        const pid = e.project_id!
        if (!map[pid]) {
          map[pid] = {
            project_id: pid,
            project_name: e.project!.name,
            project_color: e.project!.color,
            total_seconds: 0,
            entry_count: 0,
            billable_seconds: 0,
          }
        }
        map[pid].total_seconds += e.duration ?? 0
        map[pid].entry_count++
        if (e.is_billable) map[pid].billable_seconds += e.duration ?? 0
      })

    return Object.values(map).sort((a, b) => b.total_seconds - a.total_seconds).slice(0, 8)
  }, [entries])

  // Weekly bar chart data
  const weeklyData = useMemo(() => {
    return DAY_NAMES.map((day, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - now.getDay() + i)
      const key = d.toISOString().split('T')[0]
      const secs = entries
        .filter((e) => e.start_time.startsWith(key))
        .reduce((acc, e) => acc + (e.duration ?? 0), 0)
      return { day, hours: +(secs / 3600).toFixed(2) }
    })
  }, [entries])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {/* Timer mode toggle */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {(['tracker', 'pomodoro'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimerMode(mode)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                timerMode === mode
                  ? 'bg-indigo-500 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {mode === 'tracker' ? 'Tracker' : 'Pomodoro'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <StatsCards
        todaySeconds={stats.todaySeconds}
        weekSeconds={stats.weekSeconds}
        monthSeconds={stats.monthSeconds}
        efficiencyRatio={stats.efficiencyRatio}
      />

      {/* Pomodoro panel (only in pomodoro mode or deep work) */}
      {(timerMode === 'pomodoro' || deepWorkActive) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden"
        >
          <PomodoroTimer />
        </motion.div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly bar */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">This Week</h2>
          <WeeklyBarChart data={weeklyData} />
        </div>

        {/* Project donut */}
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-1">Time by Project</h2>
          <p className="text-xs text-zinc-500 mb-3">Last 30 days</p>
          <ProjectDonut data={projectStats} />
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Activity — Last 12 Weeks</h2>
        <ActivityHeatmap entries={entries} />
      </div>

      {/* Recent entries quick view (only when NOT in deep work mode) */}
      {!deepWorkActive && (
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/60">
            <h2 className="text-sm font-semibold text-zinc-300">Recent Entries</h2>
          </div>
          <div>
            {entries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-5 py-3 border-b border-zinc-800/30 last:border-0"
              >
                <div
                  className="w-1.5 h-6 rounded-full shrink-0"
                  style={{ background: entry.project?.color ?? '#52525b' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate">
                    {entry.description || <span className="text-zinc-500 italic">No description</span>}
                  </p>
                  <p className="text-xs text-zinc-500">{entry.project?.name ?? 'No project'}</p>
                </div>
                <span className="font-mono text-sm text-zinc-400 tabular-nums">
                  {formatDuration(entry.duration ?? 0)}
                </span>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="px-5 py-8 text-center text-zinc-500 text-sm">
                No entries yet. Start the timer above!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
