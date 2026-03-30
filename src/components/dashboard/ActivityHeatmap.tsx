'use client'

import { useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatHours } from '@/lib/utils/format'
import type { TimeEntry } from '@/types'

interface ActivityHeatmapProps {
  entries: TimeEntry[]
}

function getIntensity(seconds: number): string {
  if (seconds === 0) return 'bg-zinc-800/60'
  if (seconds < 1800) return 'bg-indigo-500/20'
  if (seconds < 3600) return 'bg-indigo-500/40'
  if (seconds < 7200) return 'bg-indigo-500/60'
  if (seconds < 14400) return 'bg-indigo-500/80'
  return 'bg-indigo-500'
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ActivityHeatmap({ entries }: ActivityHeatmapProps) {
  // Build a map of date -> total seconds for last 84 days (12 weeks)
  const heatmapData = useMemo(() => {
    const map: Record<string, number> = {}
    entries.forEach((e) => {
      if (!e.duration) return
      const date = e.start_time.split('T')[0]
      map[date] = (map[date] ?? 0) + e.duration
    })

    const today = new Date()
    const days: { date: string; seconds: number; display: string }[] = []

    // Start from 83 days ago, padding to Sunday
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      days.push({
        date: key,
        seconds: map[key] ?? 0,
        display: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })
    }

    // Group into weeks (columns)
    const weeks: typeof days[] = []
    // Pad start to Monday alignment
    const startDay = new Date(days[0].date).getDay()
    const padded: (typeof days[number] | null)[] = [
      ...Array.from({ length: startDay }, () => null),
      ...days,
    ]
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7).filter(Boolean) as typeof days)
    }

    return weeks
  }, [entries])

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1 justify-around">
            {DAY_LABELS.map((d) => (
              <span key={d} className="text-[10px] text-zinc-600 w-7 text-right leading-none py-0.5">
                {d}
              </span>
            ))}
          </div>

          {/* Weeks */}
          {heatmapData.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger>
                    <div
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-opacity hover:opacity-75 ${getIntensity(day.seconds)}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-zinc-900 border-zinc-700 text-xs">
                    <p className="font-medium text-white">{day.display}</p>
                    <p className="text-zinc-400">{day.seconds > 0 ? formatHours(day.seconds) : 'No activity'}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-[10px] text-zinc-600">Less</span>
          {['bg-zinc-800/60', 'bg-indigo-500/20', 'bg-indigo-500/40', 'bg-indigo-500/70', 'bg-indigo-500'].map((c) => (
            <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-zinc-600">More</span>
        </div>
      </div>
    </TooltipProvider>
  )
}
