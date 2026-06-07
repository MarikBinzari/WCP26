create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text,
  type text not null default 'private',
  password text,
  has_password boolean not null default false,
  max_players integer not null default 10,
  prizes jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  invite_code text unique,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.board_members (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.board_members enable row level security;

alter table public.boards add column if not exists has_password boolean not null default false;

create or replace function public.sync_board_password_state()
returns trigger
language plpgsql
as $$
begin
  if new.password is not null and btrim(new.password) = '' then
    new.password := null;
  end if;

  if new.password is not null and new.password !~ '^\\$2[aby]\\$' then
    new.password := crypt(new.password, gen_salt('bf'));
  end if;

  new.has_password := new.password is not null;
  return new;
end;
$$;

drop trigger if exists trg_sync_board_password_state on public.boards;
create trigger trg_sync_board_password_state
before insert or update of password on public.boards
for each row execute function public.sync_board_password_state();

update public.boards
set password = crypt(password, gen_salt('bf')),
    has_password = true
where password is not null
  and btrim(password) <> ''
  and password !~ '^\\$2[aby]\\$';

update public.boards
set password = null,
    has_password = false
where password is null or btrim(password) = '';

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_public_read') then
    create policy profiles_public_read on public.profiles for select using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_self_update') then
    create policy profiles_self_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'boards' and policyname = 'boards_public_read') then
    create policy boards_public_read on public.boards for select using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'boards' and policyname = 'boards_creator_insert') then
    create policy boards_creator_insert on public.boards for insert with check (auth.uid() = created_by);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'boards' and policyname = 'boards_creator_update') then
    create policy boards_creator_update on public.boards for update using (auth.uid() = created_by) with check (auth.uid() = created_by);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'boards' and policyname = 'boards_creator_delete') then
    create policy boards_creator_delete on public.boards for delete using (auth.uid() = created_by);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'board_members' and policyname = 'board_members_public_read') then
    create policy board_members_public_read on public.board_members for select using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'board_members' and policyname = 'board_members_self_insert') then
    create policy board_members_self_insert on public.board_members for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'board_members' and policyname = 'board_members_self_delete_or_admin') then
    create policy board_members_self_delete_or_admin on public.board_members for delete using (
      auth.uid() = user_id
      or exists (
        select 1 from public.board_members admin_row
        where admin_row.board_id = board_members.board_id
          and admin_row.user_id = auth.uid()
          and admin_row.role = 'admin'
      )
    );
  end if;
end;
$$;

revoke select on public.boards from anon, authenticated;
grant select (id, name, emoji, type, has_password, max_players, prizes, created_by, invite_code, image_url, created_at)
  on public.boards to anon, authenticated;
grant insert (name, emoji, type, password, max_players, prizes, created_by, invite_code, image_url)
  on public.boards to authenticated;
grant update (name, emoji, type, password, max_players, prizes, image_url)
  on public.boards to authenticated;
grant delete on public.boards to authenticated;

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
set search_path = public
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
    if p_password is null or crypt(p_password, v_board.password) <> v_board.password then
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
