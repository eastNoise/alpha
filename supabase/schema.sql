-- ALPHA Supabase schema
-- Run this in Supabase SQL Editor after creating the project.
-- Never expose service_role keys in the app. The Expo app should use only the publishable key.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  provider text,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alpha_state_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null,
  state jsonb not null,
  device_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

alter table public.profiles enable row level security;
alter table public.alpha_state_snapshots enable row level security;
alter table public.push_tokens enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can read own alpha state"
  on public.alpha_state_snapshots
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own alpha state"
  on public.alpha_state_snapshots
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own alpha state"
  on public.alpha_state_snapshots
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can read own push tokens"
  on public.push_tokens
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own push tokens"
  on public.push_tokens
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own push tokens"
  on public.push_tokens
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own push tokens"
  on public.push_tokens
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.touch_updated_at()
returns trigger
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists alpha_state_snapshots_touch_updated_at on public.alpha_state_snapshots;
create trigger alpha_state_snapshots_touch_updated_at
  before update on public.alpha_state_snapshots
  for each row execute function public.touch_updated_at();

drop trigger if exists push_tokens_touch_updated_at on public.push_tokens;
create trigger push_tokens_touch_updated_at
  before update on public.push_tokens
  for each row execute function public.touch_updated_at();

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.alpha_state_snapshots to authenticated;
grant select, insert, update, delete on public.push_tokens to authenticated;
