create table if not exists public.match_events (
  id            uuid primary key default gen_random_uuid(),
  match_key     text not null,
  minute        integer,
  extra_minute  integer,
  team_name     text,
  player_name   text,
  assist_name   text,
  type          text,
  detail        text,
  updated_at    timestamptz not null default now(),
  unique (match_key, minute, extra_minute, player_name, type)
);

alter table public.match_events enable row level security;

create policy match_events_public_read on public.match_events
  for select using (true);

create index if not exists match_events_match_key_idx on public.match_events (match_key);
create index if not exists match_events_type_idx on public.match_events (type);
create index if not exists match_events_player_idx on public.match_events (player_name);
