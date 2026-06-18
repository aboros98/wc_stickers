-- Mutual sticker trades: a proposal must be accepted by the recipient before
-- ANY album changes. give_ids = stickers from_user gives to to_user; take_ids =
-- stickers from_user takes from to_user (catalog ids). Albums only change via
-- accept_trade() (security definer), so no one can write to your album directly.

create table if not exists public.trades (
  id          uuid primary key default gen_random_uuid(),
  from_user   uuid not null references auth.users (id) on delete cascade,
  to_user     uuid not null references auth.users (id) on delete cascade,
  give_ids    bigint[] not null default '{}',
  take_ids    bigint[] not null default '{}',
  status      text not null default 'pending'
                check (status in ('pending', 'accepted', 'declined')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists trades_to_idx on public.trades (to_user, status);
create index if not exists trades_from_idx on public.trades (from_user, status);

alter table public.trades enable row level security;

drop policy if exists "read my trades" on public.trades;
create policy "read my trades"
  on public.trades for select
  to authenticated
  using (from_user = (select auth.uid()) or to_user = (select auth.uid()));

drop policy if exists "propose trades" on public.trades;
create policy "propose trades"
  on public.trades for insert
  to authenticated
  with check (from_user = (select auth.uid()));

-- No direct UPDATE/DELETE: status changes go through the functions below.

-- Recipient accepts → apply both albums atomically, then mark accepted.
create or replace function public.accept_trade(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  t   public.trades;
  uid uuid := (select auth.uid());
  sid bigint;
begin
  select * into t from public.trades where id = p_id for update;
  if t.id is null then raise exception 'Trade not found'; end if;
  if t.status <> 'pending' then raise exception 'Trade already resolved'; end if;
  if t.to_user <> uid then raise exception 'Only the recipient can accept'; end if;

  -- give_ids: from_user gives them to to_user
  foreach sid in array t.give_ids loop
    insert into public.user_stickers (user_id, sticker_id, count)
      values (t.from_user, sid, 0)
      on conflict (user_id, sticker_id)
      do update set count = greatest(public.user_stickers.count - 1, 0);
    insert into public.user_stickers (user_id, sticker_id, count)
      values (t.to_user, sid, 1)
      on conflict (user_id, sticker_id)
      do update set count = greatest(public.user_stickers.count, 1);
  end loop;

  -- take_ids: from_user takes them from to_user
  foreach sid in array t.take_ids loop
    insert into public.user_stickers (user_id, sticker_id, count)
      values (t.to_user, sid, 0)
      on conflict (user_id, sticker_id)
      do update set count = greatest(public.user_stickers.count - 1, 0);
    insert into public.user_stickers (user_id, sticker_id, count)
      values (t.from_user, sid, 1)
      on conflict (user_id, sticker_id)
      do update set count = greatest(public.user_stickers.count, 1);
  end loop;

  update public.trades
    set status = 'accepted', resolved_at = now()
    where id = p_id;
end;
$$;

-- Either party declines/cancels a still-pending trade.
create or replace function public.cancel_trade(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  t   public.trades;
  uid uuid := (select auth.uid());
begin
  select * into t from public.trades where id = p_id for update;
  if t.id is null or t.status <> 'pending' then return; end if;
  if t.from_user <> uid and t.to_user <> uid then
    raise exception 'Not your trade';
  end if;
  update public.trades
    set status = 'declined', resolved_at = now()
    where id = p_id;
end;
$$;

grant execute on function public.accept_trade(uuid) to authenticated;
grant execute on function public.cancel_trade(uuid) to authenticated;
