-- Rename one user's nickname/display name.
-- Run this from Supabase SQL Editor with an admin/service role context.

begin;

do $$
declare
  v_old_name text := 'johny english';
  v_new_name text := 'lupasq91';
  v_user_id uuid;
begin
  select id
    into v_user_id
  from public.profiles
  where lower(display_name) = lower(v_old_name)
  limit 1;

  if v_user_id is null then
    raise exception 'No profile found with display_name=%', v_old_name;
  end if;

  if exists (
    select 1
    from public.profiles
    where lower(display_name) = lower(v_new_name)
      and id <> v_user_id
  ) then
    raise exception 'display_name=% is already used by another profile', v_new_name;
  end if;

  update public.profiles
  set display_name = v_new_name
  where id = v_user_id;

  update auth.users
  set raw_user_meta_data = jsonb_set(
        coalesce(raw_user_meta_data, '{}'::jsonb),
        '{full_name}',
        to_jsonb(v_new_name),
        true
      )
  where id = v_user_id;

  raise notice 'Renamed user % from "%" to "%"', v_user_id, v_old_name, v_new_name;
end $$;

select
  p.id,
  p.display_name,
  u.raw_user_meta_data->>'full_name' as auth_full_name,
  u.email
from public.profiles p
left join auth.users u on u.id = p.id
where lower(p.display_name) = lower('lupasq91');

commit;
