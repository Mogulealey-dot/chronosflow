'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, DollarSign, Check, X } from 'lucide-react'
import { formatTime, formatDuration } from '@/lib/utils/format'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { TimeEntry } from '@/types'

interface TimeEntryRowProps {
  entry: TimeEntry
  selected: boolean
  onSelect: () => void
  onUpdate: (id: string, updates: Partial<TimeEntry>) => void
  onDelete: (id: string) => void
}

export function TimeEntryRow({ entry, selected, onSelect, onUpdate, onDelete }: TimeEntryRowProps) {
  const [editing, setEditing] = useState(false)
  const [editDesc, setEditDesc] = useState(entry.description)

  function saveEdit() {
    onUpdate(entry.id, { description: editDesc })
    setEditing(false)
  }

  function cancelEdit() {
    setEditDesc(entry.description)
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`group flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
        selected ? 'bg-indigo-500/5 border-l-2 border-l-indigo-500' : ''
      }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={selected}
        onChange={onSelect}
        className="w-3.5 h-3.5 rounded border-zinc-600 accent-indigo-500 cursor-pointer"
      />

      {/* Project color dot */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: entry.project?.color ?? '#52525b' }}
      />

      {/* Description – inline editable */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <Input
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            autoFocus
            className="h-7 text-sm bg-zinc-900 border-zinc-700 text-zinc-100"
          />
        ) : (
          <p
            className="text-sm text-zinc-200 truncate cursor-pointer"
            onDoubleClick={() => setEditing(true)}
          >
            {entry.description || <span className="text-zinc-500 italic">No description</span>}
          </p>
        )}
        <p className="text-xs text-zinc-500 mt-0.5">{entry.project?.name ?? 'No project'}</p>
      </div>

      {/* Billable */}
      {entry.is_billable && (
        <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5 flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
        </span>
      )}

      {/* Time range */}
      <div className="text-right text-xs text-zinc-500 tabular-nums">
        <p>{formatTime(entry.start_time)} – {entry.end_time ? formatTime(entry.end_time) : '…'}</p>
      </div>

      {/* Duration */}
      <div className="font-mono text-sm font-semibold text-zinc-200 tabular-nums w-20 text-right">
        {formatDuration(entry.duration ?? 0)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {editing ? (
          <>
            <Button size="icon" variant="ghost" onClick={saveEdit} className="w-7 h-7 text-emerald-400 hover:text-emerald-300">
              <Check className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={cancelEdit} className="w-7 h-7 text-zinc-500 hover:text-zinc-300">
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="w-7 h-7 text-zinc-500 hover:text-zinc-300">
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(entry.id)} className="w-7 h-7 text-zinc-500 hover:text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )
}
