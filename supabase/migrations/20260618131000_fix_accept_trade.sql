-- Reference the existing row in ON CONFLICT via the bare table correlation
-- (user_stickers.count), which is the portable/standard form — the previously
-- schema-qualified reference (public.user_stickers.count) can fail at runtime.
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

  foreach sid in array t.give_ids loop
    insert into public.user_stickers (user_id, sticker_id, count)
      values (t.from_user, sid, 0)
      on conflict (user_id, sticker_id)
      do update set count = greatest(user_stickers.count - 1, 0);
    insert into public.user_stickers (user_id, sticker_id, count)
      values (t.to_user, sid, 1)
      on conflict (user_id, sticker_id)
      do update set count = greatest(user_stickers.count, 1);
  end loop;

  foreach sid in array t.take_ids loop
    insert into public.user_stickers (user_id, sticker_id, count)
      values (t.to_user, sid, 0)
      on conflict (user_id, sticker_id)
      do update set count = greatest(user_stickers.count - 1, 0);
    insert into public.user_stickers (user_id, sticker_id, count)
      values (t.from_user, sid, 1)
      on conflict (user_id, sticker_id)
      do update set count = greatest(user_stickers.count, 1);
  end loop;

  update public.trades
    set status = 'accepted', resolved_at = now()
    where id = p_id;
end;
$$;
