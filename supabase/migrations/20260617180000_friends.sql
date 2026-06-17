-- =============================================================================
-- Friends: a short shareable friend_code, and read access so a friend you've
-- added can see your live Missing / Duplicates and compute swap matches.
-- (Friend-code model: any signed-in user can read profiles + collections.)
-- =============================================================================

-- Deterministic 8-char code from the user's id (e.g. 74E9D0D4).
alter table public.profiles
  add column if not exists friend_code text
  generated always as (upper(substring(replace(id::text, '-', ''), 1, 8))) stored;

create index if not exists profiles_friend_code_idx on public.profiles (friend_code);

-- Read any profile (resolve friend codes + show names).
drop policy if exists "read all profiles" on public.profiles;
create policy "read all profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- Read any user's collection (so added friends can see missing / spares).
drop policy if exists "read any stickers" on public.user_stickers;
create policy "read any stickers"
  on public.user_stickers for select
  to authenticated
  using (true);
