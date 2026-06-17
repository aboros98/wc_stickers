-- =============================================================================
-- Mutual friendships: when A adds B, the link is visible to BOTH, so B sees A
-- automatically (no separate accept). Each side can remove its own link.
-- =============================================================================

create table if not exists public.friendships (
  user_id    uuid not null references auth.users (id) on delete cascade,
  friend_id  uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

create index if not exists friendships_friend_idx on public.friendships (friend_id);

alter table public.friendships enable row level security;

drop policy if exists "read my friendships" on public.friendships;
create policy "read my friendships"
  on public.friendships for select
  to authenticated
  using (user_id = (select auth.uid()) or friend_id = (select auth.uid()));

drop policy if exists "add my friendships" on public.friendships;
create policy "add my friendships"
  on public.friendships for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "delete my friendships" on public.friendships;
create policy "delete my friendships"
  on public.friendships for delete
  to authenticated
  using (user_id = (select auth.uid()));
