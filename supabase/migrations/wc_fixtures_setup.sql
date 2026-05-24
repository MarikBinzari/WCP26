create table if not exists public.wc_fixtures (
  fixture_id    integer primary key,
  utc_date      timestamptz,
  status_short  text,
  status_long   text,
  elapsed       integer,
  venue_name    text,
  venue_city    text,
  round         text,
  home_team_id  integer,
  home_team     text,
  home_logo     text,
  away_team_id  integer,
  away_team     text,
  away_logo     text,
  home_score    integer,
  away_score    integer,
  home_ht       integer,
  away_ht       integer,
  home_et       integer,
  away_et       integer,
  home_pen      integer,
  away_pen      integer,
  updated_at    timestamptz default now()
);

alter table public.wc_fixtures enable row level security;

create policy "public_read_wc_fixtures"
  on public.wc_fixtures for select
  using (true);

create policy "service_write_wc_fixtures"
  on public.wc_fixtures for all
  using (auth.role() = 'service_role');
