'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Trash2, Search, Download } from 'lucide-react'
import { useTimeEntries } from '@/lib/hooks/useTimeEntries'
import { TimeEntryRow } from '@/components/timesheets/TimeEntryRow'
import { formatDate, formatDuration } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { TimeEntry } from '@/types'

export default function TimesheetsPage() {
  const { entries, loading, updateEntry, deleteEntry, bulkDelete } = useTimeEntries(500)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return entries
    const q = search.toLowerCase()
    return entries.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.project?.name?.toLowerCase().includes(q)
    )
  }, [entries, search])

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, TimeEntry[]>()
    filtered.forEach((e) => {
      const key = e.start_time.split('T')[0]
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    })
    return map
  }, [filtered])

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((e) => e.id)))
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected)
    await bulkDelete(ids)
    setSelected(new Set())
    toast.success(`Deleted ${ids.length} entries`)
  }

  function exportCSV() {
    const rows = [
      ['Description', 'Project', 'Start', 'End', 'Duration (s)', 'Billable'],
      ...filtered.map((e) => [
        e.description,
        e.project?.name ?? '',
        e.start_time,
        e.end_time ?? '',
        e.duration ?? 0,
        e.is_billable ? 'Yes' : 'No',
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chronosflow-timesheets-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  const totalSeconds = filtered.reduce((acc, e) => acc + (e.duration ?? 0), 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Timesheets</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {filtered.length} entries · {formatDuration(totalSeconds)} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-1.5 h-8"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete {selected.size}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="gap-1.5 h-8 border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries..."
          className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 h-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 overflow-hidden">
        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800/60">
          <input
            type="checkbox"
            checked={selected.size === filtered.length && filtered.length > 0}
            onChange={selectAll}
            className="w-3.5 h-3.5 rounded border-zinc-600 accent-indigo-500 cursor-pointer"
          />
          <div className="w-2" />
          <span className="flex-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">Description</span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider w-16">Billable</span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider w-32 text-right">Time</span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider w-20 text-right">Duration</span>
          <div className="w-14" />
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-zinc-500 text-sm">Loading...</div>
        ) : grouped.size === 0 ? (
          <div className="px-5 py-10 text-center text-zinc-500 text-sm">No entries found.</div>
        ) : (
          Array.from(grouped.entries()).map(([date, dayEntries]) => {
            const dayTotal = dayEntries.reduce((acc, e) => acc + (e.duration ?? 0), 0)
            return (
              <div key={date}>
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/40 border-b border-zinc-800/40">
                  <span className="text-xs font-semibold text-zinc-400">{formatDate(date)}</span>
                  <Badge variant="secondary" className="text-xs font-mono bg-zinc-800 text-zinc-400 border-zinc-700">
                    {formatDuration(dayTotal)}
                  </Badge>
                </div>
                <AnimatePresence>
                  {dayEntries.map((entry) => (
                    <TimeEntryRow
                      key={entry.id}
                      entry={entry}
                      selected={selected.has(entry.id)}
                      onSelect={() => toggleSelect(entry.id)}
                      onUpdate={updateEntry}
                      onDelete={deleteEntry}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
