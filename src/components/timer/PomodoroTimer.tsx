'use client'

import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react'
import { useTimerStore } from '@/lib/store/timer-store'
import { formatDuration } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'

const PHASE_LABELS = {
  work: 'Focus Time',
  short_break: 'Short Break',
  long_break: 'Long Break',
}

const PHASE_COLORS = {
  work: 'text-indigo-400',
  short_break: 'text-emerald-400',
  long_break: 'text-blue-400',
}

const TOTAL_DURATIONS = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
}

export function PomodoroTimer() {
  const {
    pomodoroPhase,
    pomodoroRemaining,
    pomodoroRunning,
    pomodoroCount,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
  } = useTimerStore()

  const total = TOTAL_DURATIONS[pomodoroPhase]
  const progress = ((total - pomodoroRemaining) / total) * 100
  const circumference = 2 * Math.PI * 54

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Phase indicator */}
      <div className="flex gap-2">
        {(['work', 'short_break', 'long_break'] as const).map((phase) => (
          <span
            key={phase}
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              pomodoroPhase === phase
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-zinc-500'
            }`}
          >
            {PHASE_LABELS[phase]}
          </span>
        ))}
      </div>

      {/* SVG ring timer */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-zinc-800"
          />
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            stroke={pomodoroPhase === 'work' ? '#6366f1' : pomodoroPhase === 'short_break' ? '#22c55e' : '#3b82f6'}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progress / 100) * circumference}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-bold text-white tabular-nums">
            {formatDuration(pomodoroRemaining)}
          </span>
          <span className={`text-xs font-medium ${PHASE_COLORS[pomodoroPhase]}`}>
            {PHASE_LABELS[pomodoroPhase]}
          </span>
        </div>
      </div>

      {/* Session count */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < (pomodoroCount % 4) ? 'bg-indigo-500' : 'bg-zinc-700'
            }`}
          />
        ))}
        <span className="text-xs text-zinc-500 ml-1">Session {pomodoroCount + 1}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={resetPomodoro}
          className="w-9 h-9 border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          onClick={pomodoroRunning ? pausePomodoro : startPomodoro}
          size="sm"
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 h-10"
        >
          {pomodoroRunning ? (
            <><Pause className="w-4 h-4 mr-1.5" /> Pause</>
          ) : (
            <><Play className="w-4 h-4 mr-1.5 fill-current" /> {pomodoroPhase === 'work' ? 'Focus' : 'Break'}</>
          )}
        </Button>
        {pomodoroPhase === 'work' && (
          <Button
            variant="outline"
            size="icon"
            title="Take a break"
            className="w-9 h-9 border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-emerald-400"
          >
            <Coffee className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
