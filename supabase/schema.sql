-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Utility trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- User profile table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  gender text not null default 'male',
  age integer not null default 27,
  height_cm numeric(5,2) not null default 178,
  weight_kg numeric(5,2) not null default 78,
  goal_weight_kg numeric(5,2) not null default 74,
  activity_level text not null default 'moderate',
  goal_type text not null default 'maintain',
  bmr numeric(10,2) not null default 0,
  tdee numeric(10,2) not null default 0,
  calories_target integer not null default 2200,
  water_target_cups integer not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
for delete using (auth.uid() = id);

-- Meal logs
create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_name text not null,
  calories integer not null default 0,
  protein integer not null default 0,
  carbs integer not null default 0,
  fat integer not null default 0,
  log_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists meal_logs_user_date_idx on public.meal_logs (user_id, log_date desc, created_at desc);

alter table public.meal_logs enable row level security;

drop policy if exists "meal_logs_select_own" on public.meal_logs;
create policy "meal_logs_select_own" on public.meal_logs
for select using (auth.uid() = user_id);

drop policy if exists "meal_logs_insert_own" on public.meal_logs;
create policy "meal_logs_insert_own" on public.meal_logs
for insert with check (auth.uid() = user_id);

drop policy if exists "meal_logs_update_own" on public.meal_logs;
create policy "meal_logs_update_own" on public.meal_logs
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "meal_logs_delete_own" on public.meal_logs;
create policy "meal_logs_delete_own" on public.meal_logs
for delete using (auth.uid() = user_id);

-- Weight tracking
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric(5,2) not null,
  log_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists weight_logs_user_date_idx on public.weight_logs (user_id, log_date desc, created_at desc);

alter table public.weight_logs enable row level security;

drop policy if exists "weight_logs_select_own" on public.weight_logs;
create policy "weight_logs_select_own" on public.weight_logs
for select using (auth.uid() = user_id);

drop policy if exists "weight_logs_insert_own" on public.weight_logs;
create policy "weight_logs_insert_own" on public.weight_logs
for insert with check (auth.uid() = user_id);

drop policy if exists "weight_logs_update_own" on public.weight_logs;
create policy "weight_logs_update_own" on public.weight_logs
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "weight_logs_delete_own" on public.weight_logs;
create policy "weight_logs_delete_own" on public.weight_logs
for delete using (auth.uid() = user_id);

-- Daily metrics for water and summary
create table if not exists public.daily_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  water_cups integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

drop trigger if exists set_daily_metrics_updated_at on public.daily_metrics;
create trigger set_daily_metrics_updated_at
before update on public.daily_metrics
for each row execute function public.set_updated_at();

create index if not exists daily_metrics_user_date_idx on public.daily_metrics (user_id, log_date desc);

alter table public.daily_metrics enable row level security;

drop policy if exists "daily_metrics_select_own" on public.daily_metrics;
create policy "daily_metrics_select_own" on public.daily_metrics
for select using (auth.uid() = user_id);

drop policy if exists "daily_metrics_insert_own" on public.daily_metrics;
create policy "daily_metrics_insert_own" on public.daily_metrics
for insert with check (auth.uid() = user_id);

drop policy if exists "daily_metrics_update_own" on public.daily_metrics;
create policy "daily_metrics_update_own" on public.daily_metrics
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "daily_metrics_delete_own" on public.daily_metrics;
create policy "daily_metrics_delete_own" on public.daily_metrics
for delete using (auth.uid() = user_id);
