'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { useTimeEntries } from '@/lib/hooks/useTimeEntries'
import { useProjects } from '@/lib/hooks/useProjects'
import { useProjectAnalytics } from '@/lib/hooks/useProjectAnalytics'
import { formatHours } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PDFReport } from '@/components/reports/PDFReport'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type Range = '7d' | '30d' | '90d'

export default function ReportsPage() {
  const { entries } = useTimeEntries(1000)
  const { projects } = useProjects()
  const { data: analytics, refetch: refetchAnalytics } = useProjectAnalytics()
  const [range, setRange] = useState<Range>('30d')
  const [userName, setUserName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserName(user?.user_metadata?.full_name ?? user?.email ?? 'User')
    })
  }, []) // eslint-disable-line

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90

  const filtered = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return entries.filter((e) => new Date(e.start_time) >= cutoff)
  }, [entries, days])

  // Daily line chart
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {}
    filtered.forEach((e) => {
      const key = e.start_time.split('T')[0]
      map[key] = (map[key] ?? 0) + (e.duration ?? 0) / 3600
    })
    const result: { date: string; hours: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      result.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: +(map[key] ?? 0).toFixed(2),
      })
    }
    return result
  }, [filtered, days])

  // Project breakdown
  const projectBreakdown = useMemo(() => {
    const map: Record<string, { name: string; color: string; seconds: number; billable: number }> = {}
    filtered.forEach((e) => {
      if (!e.project) return
      const id = e.project_id!
      if (!map[id]) map[id] = { name: e.project.name, color: e.project.color, seconds: 0, billable: 0 }
      map[id].seconds += e.duration ?? 0
      if (e.is_billable) map[id].billable += e.duration ?? 0
    })
    return Object.values(map).sort((a, b) => b.seconds - a.seconds)
  }, [filtered])

  const totalSeconds = filtered.reduce((acc, e) => acc + (e.duration ?? 0), 0)
  const billableSeconds = filtered.filter((e) => e.is_billable).reduce((acc, e) => acc + (e.duration ?? 0), 0)
  const billableRate = totalSeconds > 0 ? ((billableSeconds / totalSeconds) * 100).toFixed(0) : '0'

  function exportCSV() {
    const rows = [
      ['Date', 'Hours'],
      ...dailyData.map((d) => [d.date, d.hours]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `chronosflow-report-${range}.csv`
    a.click()
    toast.success('Report exported')
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Analytics for the last {days} days</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Range toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  range === r ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="gap-1.5 h-8 border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </Button>
          <PDFReport data={analytics} userName={userName} />
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Tracked', value: formatHours(totalSeconds), sub: `${filtered.length} entries` },
          { label: 'Billable', value: formatHours(billableSeconds), sub: `${billableRate}% of total` },
          { label: 'Avg / Day', value: `${(totalSeconds / 3600 / days).toFixed(1)}h`, sub: `over ${days} days` },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs font-medium text-zinc-500 uppercase tracking-wider">{kpi.label}</p>
            <p className="text-lg sm:text-2xl font-bold text-white mt-1 tabular-nums">{kpi.value}</p>
            <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Daily trend */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Daily Tracked Hours</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#71717a', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={Math.floor(days / 8)}
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
              labelStyle={{ color: '#e4e4e7' }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Project breakdown table */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/60">
          <h2 className="text-sm font-semibold text-zinc-300">Project Breakdown</h2>
        </div>
        {projectBreakdown.length === 0 ? (
          <div className="px-5 py-8 text-center text-zinc-500 text-sm">No data in selected range.</div>
        ) : (
          projectBreakdown.map((p) => {
            const pct = totalSeconds > 0 ? (p.seconds / totalSeconds) * 100 : 0
            return (
              <div
                key={p.name}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-zinc-800/30 last:border-0"
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="flex-1 text-sm text-zinc-200 font-medium truncate">{p.name}</span>
                <div className="hidden sm:block w-32 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: p.color }}
                  />
                </div>
                <span className="hidden sm:inline text-xs text-zinc-500 w-10 text-right">{pct.toFixed(0)}%</span>
                <span className="font-mono text-sm text-zinc-300 tabular-nums w-16 text-right shrink-0">
                  {formatHours(p.seconds)}
                </span>
                {p.billable > 0 && (
                  <Badge variant="secondary" className="hidden sm:inline-flex text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    ${((p.billable / 3600)).toFixed(0)}h billable
                  </Badge>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
