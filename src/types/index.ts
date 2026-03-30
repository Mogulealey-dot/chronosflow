export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  hourly_rate: number | null
  currency: string
  color: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  client_id: string | null
  name: string
  color: string
  hourly_rate: number | null
  currency: string
  budget_hours: number | null
  is_billable: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  client?: Client
  total_hours?: number
}

export interface TimeEntry {
  id: string
  user_id: string
  project_id: string | null
  description: string
  start_time: string
  end_time: string | null
  duration: number | null // in seconds
  is_billable: boolean
  is_running: boolean
  estimated_seconds: number | null
  tags: string[]
  created_at: string
  updated_at: string
  project?: Project
}

export interface ActiveTimer {
  id: string | null
  project_id: string | null
  description: string
  is_billable: boolean
  start_time: string | null
  elapsed: number // seconds
  is_running: boolean
}

export interface DashboardStats {
  totalTrackedToday: number
  totalTrackedWeek: number
  totalTrackedMonth: number
  efficiencyRatio: number
  topProject: string | null
  entriesCount: number
}

export interface ProjectStats {
  project_id: string
  project_name: string
  project_color: string
  total_seconds: number
  entry_count: number
  billable_seconds: number
}

export type TimerMode = 'tracker' | 'pomodoro'
export type PomodoroPhase = 'work' | 'short_break' | 'long_break'
export type Theme = 'dark' | 'light'
export type SidebarState = 'expanded' | 'collapsed'
