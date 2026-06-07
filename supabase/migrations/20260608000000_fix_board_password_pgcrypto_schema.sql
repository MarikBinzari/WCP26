create extension if not exists pgcrypto with schema extensions;

create or replace function public.sync_board_password_state()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  if new.password is not null and btrim(new.password) = '' then
    new.password := null;
  end if;

  if new.password is not null and new.password !~ '^\\$2[aby]\\$' then
    new.password := extensions.crypt(new.password, extensions.gen_salt('bf'));
  end if;

  new.has_password := new.password is not null;
  return new;
end;
$$;

update public.boards
set password = extensions.crypt(password, extensions.gen_salt('bf')),
    has_password = true
where password is not null
  and btrim(password) <> ''
  and password !~ '^\\$2[aby]\\$';

create or replace function public.join_board(
  p_board_id uuid default null,
  p_invite_code text default null,
  p_password text default null
)
returns table (
  id uuid,
  name text,
  emoji text,
  type text,
  max_players integer,
  prizes jsonb,
  created_by uuid,
  invite_code text,
  image_url text,
  created_at timestamptz,
  has_password boolean
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_board public.boards%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  select *
  into v_board
  from public.boards b
  where (p_board_id is not null and b.id = p_board_id)
     or (p_board_id is null and p_invite_code is not null and upper(b.invite_code) = upper(p_invite_code))
  limit 1;

  if v_board.id is null then
    raise exception 'Invalid code or league';
  end if;

  if v_board.password is not null then
    if p_password is null or extensions.crypt(p_password, v_board.password) <> v_board.password then
      raise exception 'Incorrect password';
    end if;
  end if;

  insert into public.board_members (board_id, user_id, role)
  values (v_board.id, auth.uid(), 'member')
  on conflict (board_id, user_id) do nothing;

  return query
  select b.id, b.name, b.emoji, b.type, b.max_players, b.prizes, b.created_by,
         b.invite_code, b.image_url, b.created_at, b.has_password
  from public.boards b
  where b.id = v_board.id;
end;
$$;

grant execute on function public.join_board(uuid, text, text) to authenticated;
