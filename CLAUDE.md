# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

No test framework is configured.

## Stack

- **Framework:** Next.js 16.2 (App Router), React 19, TypeScript 5
- **Database/Auth:** Supabase (PostgreSQL + Realtime + SSR auth)
- **State:** Zustand 5 with `persist` + `subscribeWithSelector` middleware
- **Styling:** Tailwind CSS 4, shadcn/ui components
- **Charts:** Recharts 3
- **PDF export:** `@react-pdf/renderer`
- **Deployment:** Netlify via `@netlify/plugin-nextjs`

## Environment

Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Architecture

**Route groups:**
- `src/app/(auth)/` — `/login`, `/signup` — redirects to dashboard if already authed
- `src/app/(dashboard)/` — all protected routes (dashboard, projects, timesheets, reports, settings)
- Auth is enforced by `src/middleware.ts` using `@supabase/ssr`

**Data layer:**
- Supabase tables: `profiles`, `clients`, `projects`, `time_entries`
- All hooks live in `src/lib/hooks/` — each fetches data via Supabase client, subscribes to `postgres_changes` for realtime updates, and exposes CRUD functions
- Key hooks: `useTimer`, `useTimeEntries`, `useProjects`, `useProjectAnalytics`
- Projects use soft deletes via `is_archived` flag

**Client-side state (`src/lib/store/timer-store.ts`):**
- Persisted to `localStorage` under key `chronosflow-timer`
- Manages: active tracker state (description, project, billable, elapsed), Pomodoro phase/remaining/cycles, deep work mode, sidebar collapse

**Timer lifecycle (`src/lib/hooks/useTimer.ts`):**
- Starting the timer inserts a `time_entries` row with `end_time = null`
- Stopping updates `end_time` and `duration`
- `setInterval` ticks elapsed time client-side; Supabase Realtime syncs across tabs

**Type definitions:** All shared interfaces are in `src/types/index.ts` (`Profile`, `Client`, `Project`, `TimeEntry`, `ActiveTimer`, `DashboardStats`, `ProjectStats`).

**Utilities:** `src/lib/utils/format.ts` — duration formatting, color utilities, efficiency ratio calculation.

## Patterns

- Supabase browser client: `src/lib/supabase/client.ts`; server client: `src/lib/supabase/server.ts`
- Path alias `@/*` maps to `src/*`
- Dark theme enforced at root layout level (zinc/indigo palette)
- PDF reports generated via `src/components/reports/PDFReport.tsx`
- CSV export built directly into the timesheets page
