-- Prefer a real name/avatar (from email-signup metadata or Google) over the
-- email local-part when creating a profile. Falls back to the email prefix.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    split_part(coalesce(new.email, 'collector'), '@', 1),
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      split_part(coalesce(new.email, 'Collector'), '@', 1)
    ),
    coalesce(
      nullif(new.raw_user_meta_data->>'avatar_url', ''),
      nullif(new.raw_user_meta_data->>'picture', '')
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Backfill existing profiles with the real name/avatar from their auth metadata.
update public.profiles p
set
  display_name = coalesce(
    nullif(u.raw_user_meta_data->>'full_name', ''),
    nullif(u.raw_user_meta_data->>'name', ''),
    p.display_name
  ),
  avatar_url = coalesce(
    p.avatar_url,
    nullif(u.raw_user_meta_data->>'avatar_url', ''),
    nullif(u.raw_user_meta_data->>'picture', '')
  )
from auth.users u
where u.id = p.id;
