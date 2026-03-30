'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square, DollarSign, Timer, Zap } from 'lucide-react'
import { useTimer } from '@/lib/hooks/useTimer'
import { useTimerStore } from '@/lib/store/timer-store'
import { useProjects } from '@/lib/hooks/useProjects'
import { formatDuration } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function GlobalTimer() {
  const { timer, handleStart, handleStop } = useTimer()
  const { updateDescription, updateProject, toggleBillable, toggleDeepWork, deepWorkActive } =
    useTimerStore()
  const { projects } = useProjects()
  const [desc, setDesc] = useState(timer.description)

  // Sync description input with store
  useEffect(() => {
    setDesc(timer.description)
  }, [timer.description])

  function handleDescChange(val: string) {
    setDesc(val)
    updateDescription(val)
  }

  function onStart() {
    handleStart(desc, timer.project_id, timer.is_billable)
  }

  return (
    <header className="h-14 border-b border-zinc-800/60 bg-zinc-950/95 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
      {/* Deep work badge */}
      <AnimatePresence>
        {deepWorkActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded-md px-2 py-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium whitespace-nowrap">Deep Work</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description */}
      <Input
        value={desc}
        onChange={(e) => handleDescChange(e.target.value)}
        placeholder="What are you working on?"
        className="flex-1 min-w-0 h-9 bg-zinc-900 border-zinc-700/60 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !timer.is_running) onStart()
        }}
      />

      {/* Project picker */}
      <Select
        value={timer.project_id ?? 'none'}
        onValueChange={(v) => updateProject(v === 'none' ? null : v)}
      >
        <SelectTrigger className="w-36 h-9 bg-zinc-900 border-zinc-700/60 text-sm text-zinc-300 focus:ring-indigo-500/50">
          <SelectValue placeholder="No project" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          <SelectItem value="none" className="text-zinc-400">
            No project
          </SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ background: p.color }}
                />
                {p.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Billable toggle */}
      <button
        onClick={toggleBillable}
        title={timer.is_billable ? 'Billable' : 'Non-billable'}
        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
          timer.is_billable
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
            : 'bg-zinc-900 border-zinc-700/60 text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <DollarSign className="w-4 h-4" />
      </button>

      {/* Deep work toggle */}
      <button
        onClick={toggleDeepWork}
        title="Toggle Deep Work mode"
        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
          deepWorkActive
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
            : 'bg-zinc-900 border-zinc-700/60 text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Zap className="w-4 h-4" />
      </button>

      {/* Timer display */}
      <div className="font-mono text-lg font-semibold text-zinc-100 tabular-nums w-24 text-center select-none">
        {formatDuration(timer.elapsed)}
      </div>

      {/* Start/Stop */}
      {timer.is_running ? (
        <Button
          onClick={handleStop}
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-white h-9 px-4 gap-2"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          Stop
        </Button>
      ) : (
        <Button
          onClick={onStart}
          size="sm"
          className="bg-indigo-500 hover:bg-indigo-600 text-white h-9 px-4 gap-2"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Start
        </Button>
      )}
    </header>
  )
}
