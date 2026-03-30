-- ============================================================
-- ChronosFlow — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text,
  avatar_url  text,
  timezone    text not null default 'UTC',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────
create table public.clients (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  email       text,
  hourly_rate numeric(10,2),
  currency    text not null default 'USD',
  color       text not null default '#6366f1',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Users CRUD own clients"
  on public.clients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────
create table public.projects (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  client_id   uuid references public.clients(id) on delete set null,
  name        text not null,
  color       text not null default '#6366f1',
  hourly_rate numeric(10,2),
  currency    text not null default 'USD',
  budget_hours numeric(10,2),
  is_billable boolean not null default false,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users CRUD own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_projects_user_id on public.projects(user_id);
create index idx_projects_client_id on public.projects(client_id);

-- ─────────────────────────────────────────
-- TIME ENTRIES
-- ─────────────────────────────────────────
create table public.time_entries (
  id                uuid default uuid_generate_v4() primary key,
  user_id           uuid references auth.users(id) on delete cascade not null,
  project_id        uuid references public.projects(id) on delete set null,
  description       text not null default '',
  start_time        timestamptz not null default now(),
  end_time          timestamptz,
  duration          integer,                          -- seconds
  is_billable       boolean not null default false,
  is_running        boolean not null default false,
  estimated_seconds integer,                          -- for efficiency ratio
  tags              text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.time_entries enable row level security;

create policy "Users CRUD own time entries"
  on public.time_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_time_entries_user_id    on public.time_entries(user_id);
create index idx_time_entries_project_id on public.time_entries(project_id);
create index idx_time_entries_start_time on public.time_entries(start_time desc);
create index idx_time_entries_is_running on public.time_entries(is_running) where is_running = true;

-- Auto-compute duration on stop
create or replace function public.compute_duration()
returns trigger language plpgsql as $$
begin
  if new.end_time is not null and new.start_time is not null and new.duration is null then
    new.duration := extract(epoch from (new.end_time - new.start_time))::integer;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger time_entries_compute_duration
  before insert or update on public.time_entries
  for each row execute procedure public.compute_duration();

-- ─────────────────────────────────────────
-- REALTIME
-- ─────────────────────────────────────────
-- Enable realtime for the timer sync feature
alter publication supabase_realtime add table public.time_entries;

-- ─────────────────────────────────────────
-- HELPFUL VIEWS (used by reports)
-- ─────────────────────────────────────────

-- Total hours per project (used by the projects list)
create or replace view public.project_hours as
  select
    p.id as project_id,
    p.user_id,
    coalesce(sum(te.duration), 0) / 3600.0 as total_hours
  from public.projects p
  left join public.time_entries te
    on te.project_id = p.id and te.is_running = false
  group by p.id, p.user_id;
