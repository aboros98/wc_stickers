-- =============================================================================
-- Panini WC2026 Sticker Tracker — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
--
-- Model: a shared, read-only `catalog` of all 980 stickers; per-user `profiles`;
-- and `user_stickers` holding ONE integer count per (user, sticker):
--     count = 0  -> missing
--     count = 1  -> have
--     count >= 2 -> have + (count - 1) duplicates available to swap
-- "Missing" and "duplicates" are then just queries over these tables.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. CATALOG — the master list of every sticker (identical for all users).
--    Loaded once by supabase/import-catalog.mjs (service_role). Read-only to users.
-- ---------------------------------------------------------------------------
create table if not exists public.catalog (
  id            bigint generated always as identity primary key,
  sticker_code  text not null unique,              -- business key: "ARG17", "FWC9", "00"
  country       text,                              -- "Argentina" (null for FWC/specials)
  country_code  text not null,                     -- "ARG" / "FWC" — groups the grid into sections
  slot_no       int  not null default 0,           -- 1..20 within a team (0 for specials)
  type          text not null default 'regular'    -- 'regular' | 'foil' | 'special'
                  check (type in ('regular', 'foil', 'special')),
  section       text not null default 'team'       -- 'team' | 'special'
                  check (section in ('team', 'special')),
  label         text,                              -- player name / "Team Badge" / "Team Photo" / "FIFA Museum 1986"
  page_no       int,                               -- album page, for album-order grouping
  sort_order    int  not null default 0,           -- stable display order across the whole album
  image_url     text,
  created_at    timestamptz not null default now()
);

create index if not exists catalog_country_code_idx on public.catalog (country_code, slot_no);
create index if not exists catalog_sort_idx         on public.catalog (sort_order);

-- ---------------------------------------------------------------------------
-- 2. PROFILES — one row per auth user (auto-created on signup by a trigger).
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. USER_STICKERS — the heart of the app. One row per (user, sticker) touched.
-- ---------------------------------------------------------------------------
create table if not exists public.user_stickers (
  user_id     uuid   not null references auth.users (id) on delete cascade,
  sticker_id  bigint not null references public.catalog (id) on delete cascade,
  count       int    not null default 0 check (count >= 0),
  updated_at  timestamptz not null default now(),
  primary key (user_id, sticker_id)
);

create index if not exists user_stickers_user_idx on public.user_stickers (user_id);

-- keep updated_at fresh on every change
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_stickers_touch on public.user_stickers;
create trigger user_stickers_touch
  before update on public.user_stickers
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Auto-create a profile when a new auth user signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    -- default username from the email local-part; uniqueness handled by retry-on-conflict in app if needed
    split_part(coalesce(new.email, 'collector'), '@', 1),
    split_part(coalesce(new.email, 'Collector'), '@', 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
alter table public.catalog       enable row level security;
alter table public.profiles      enable row level security;
alter table public.user_stickers enable row level security;

-- CATALOG: world-readable; NO write policy => only service_role can modify it.
drop policy if exists "catalog is readable by everyone" on public.catalog;
create policy "catalog is readable by everyone"
  on public.catalog for select
  to anon, authenticated
  using (true);

-- PROFILES: a user can read & edit only their own profile.
drop policy if exists "read own profile"   on public.profiles;
drop policy if exists "insert own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;

create policy "read own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- USER_STICKERS: a user can do anything with ONLY their own rows.
drop policy if exists "read own stickers"   on public.user_stickers;
drop policy if exists "insert own stickers" on public.user_stickers;
drop policy if exists "update own stickers" on public.user_stickers;
drop policy if exists "delete own stickers" on public.user_stickers;

create policy "read own stickers"
  on public.user_stickers for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "insert own stickers"
  on public.user_stickers for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "update own stickers"
  on public.user_stickers for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "delete own stickers"
  on public.user_stickers for delete
  to authenticated
  using ((select auth.uid()) = user_id);
