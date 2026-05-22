-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: Create players table
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.players (
  id              serial primary key,
  api_id          integer,                         -- football-data.org player id
  api_football_id integer,                         -- api-football.com player id
  team_name       text        not null,             -- normalized team name (matches our app)
  player_name     text        not null,
  position        text,                             -- Goalkeeper | Defence | Midfield | Offence
  shirt_number    integer,
  date_of_birth   date,
  nationality     text,
  photo_url       text,
  height          text,
  weight          text,
  goals           integer     not null default 0,
  assists         integer     not null default 0,
  yellow_cards    integer     not null default 0,
  red_cards       integer     not null default 0,
  minutes_played  integer     not null default 0,
  rating          numeric(4,2),
  appearances     integer     not null default 0,
  updated_at      timestamptz not null default now()
);

-- Unique indexes
create unique index if not exists players_api_id_idx
  on public.players(api_id) where api_id is not null;

create unique index if not exists players_api_football_id_idx
  on public.players(api_football_id) where api_football_id is not null;

create unique index if not exists players_team_player_idx
  on public.players(team_name, player_name);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: Row Level Security
-- ═══════════════════════════════════════════════════════════════════════════
alter table public.players enable row level security;

-- Anyone (including anonymous) can read
create policy "public_read_players"
  on public.players for select
  using (true);

-- Only service role (Edge Function) can insert/update/delete
create policy "service_write_players"
  on public.players for all
  using (auth.role() = 'service_role');
