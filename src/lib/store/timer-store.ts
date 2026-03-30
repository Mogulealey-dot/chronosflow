'use client'

import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import type { ActiveTimer, TimerMode, PomodoroPhase } from '@/types'

interface TimerStore {
  // Active tracker timer
  timer: ActiveTimer
  // Pomodoro
  timerMode: TimerMode
  pomodoroPhase: PomodoroPhase
  pomodoroCount: number
  pomodoroRemaining: number // seconds
  pomodoroRunning: boolean
  // Deep work mode
  deepWorkActive: boolean
  // Sidebar
  sidebarCollapsed: boolean
  // Actions
  startTimer: (description: string, projectId: string | null, isBillable: boolean) => void
  stopTimer: () => void
  updateDescription: (description: string) => void
  updateProject: (projectId: string | null) => void
  toggleBillable: () => void
  tickTimer: () => void
  setTimerFromDB: (timer: Partial<ActiveTimer>) => void
  // Pomodoro
  startPomodoro: () => void
  pausePomodoro: () => void
  resetPomodoro: () => void
  tickPomodoro: () => void
  setTimerMode: (mode: TimerMode) => void
  // Deep work
  toggleDeepWork: () => void
  // Sidebar
  toggleSidebar: () => void
}

const POMODORO_DURATIONS: Record<PomodoroPhase, number> = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
}

export const useTimerStore = create<TimerStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        timer: {
          id: null,
          project_id: null,
          description: '',
          is_billable: false,
          start_time: null,
          elapsed: 0,
          is_running: false,
        },
        timerMode: 'tracker',
        pomodoroPhase: 'work',
        pomodoroCount: 0,
        pomodoroRemaining: POMODORO_DURATIONS.work,
        pomodoroRunning: false,
        deepWorkActive: false,
        sidebarCollapsed: false,

        startTimer: (description, projectId, isBillable) => {
          const now = new Date().toISOString()
          set({
            timer: {
              id: null,
              project_id: projectId,
              description,
              is_billable: isBillable,
              start_time: now,
              elapsed: 0,
              is_running: true,
            },
          })
        },

        stopTimer: () => {
          set((state) => ({
            timer: {
              ...state.timer,
              is_running: false,
              start_time: null,
              elapsed: 0,
              id: null,
            },
          }))
        },

        updateDescription: (description) =>
          set((state) => ({ timer: { ...state.timer, description } })),

        updateProject: (projectId) =>
          set((state) => ({ timer: { ...state.timer, project_id: projectId } })),

        toggleBillable: () =>
          set((state) => ({
            timer: { ...state.timer, is_billable: !state.timer.is_billable },
          })),

        tickTimer: () =>
          set((state) => ({
            timer: { ...state.timer, elapsed: state.timer.elapsed + 1 },
          })),

        setTimerFromDB: (partial) =>
          set((state) => ({ timer: { ...state.timer, ...partial } })),

        startPomodoro: () => set({ pomodoroRunning: true }),
        pausePomodoro: () => set({ pomodoroRunning: false }),
        resetPomodoro: () =>
          set((state) => ({
            pomodoroRunning: false,
            pomodoroRemaining: POMODORO_DURATIONS[state.pomodoroPhase],
          })),

        tickPomodoro: () => {
          const { pomodoroRemaining, pomodoroPhase, pomodoroCount } = get()
          if (pomodoroRemaining <= 0) {
            // Advance phase
            let nextPhase: PomodoroPhase = 'short_break'
            let nextCount = pomodoroCount
            if (pomodoroPhase === 'work') {
              nextCount += 1
              nextPhase = nextCount % 4 === 0 ? 'long_break' : 'short_break'
            } else {
              nextPhase = 'work'
            }
            set({
              pomodoroPhase: nextPhase,
              pomodoroCount: nextCount,
              pomodoroRemaining: POMODORO_DURATIONS[nextPhase],
              pomodoroRunning: false,
            })
          } else {
            set({ pomodoroRemaining: pomodoroRemaining - 1 })
          }
        },

        setTimerMode: (mode) => set({ timerMode: mode }),
        toggleDeepWork: () =>
          set((state) => ({ deepWorkActive: !state.deepWorkActive })),
        toggleSidebar: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      }),
      {
        name: 'chronosflow-timer',
        partialize: (state) => ({
          timer: state.timer,
          timerMode: state.timerMode,
          pomodoroPhase: state.pomodoroPhase,
          pomodoroCount: state.pomodoroCount,
          pomodoroRemaining: state.pomodoroRemaining,
          deepWorkActive: state.deepWorkActive,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    )
  )
)
