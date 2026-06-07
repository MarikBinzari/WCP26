create extension if not exists pgcrypto with schema extensions;

create or replace function public.is_bcrypt_hash(value text)
returns boolean
language sql
immutable
as $$
  select value is not null
     and (
       starts_with(value, '$2a$')
       or starts_with(value, '$2b$')
       or starts_with(value, '$2y$')
     );
$$;

create or replace function public.sync_board_password_state()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  if new.password is not null and btrim(new.password) = '' then
    new.password := null;
  end if;

  if new.password is not null and not public.is_bcrypt_hash(new.password) then
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
  and not public.is_bcrypt_hash(password);

update public.boards
set password = null,
    has_password = false
where password is null or btrim(password) = '';
