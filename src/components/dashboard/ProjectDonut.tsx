'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatHours } from '@/lib/utils/format'
import type { ProjectStats } from '@/types'

interface ProjectDonutProps {
  data: ProjectStats[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: ProjectStats }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="font-medium text-white">{d.project_name}</p>
      <p className="text-zinc-400">{formatHours(d.total_seconds)}</p>
      <p className="text-zinc-500 text-xs">{d.entry_count} entries</p>
    </div>
  )
}

export function ProjectDonut({ data }: ProjectDonutProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">
        No data yet. Start tracking!
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="total_seconds"
          nameKey="project_name"
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.project_id} fill={entry.project_color} opacity={0.85} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-zinc-400">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
