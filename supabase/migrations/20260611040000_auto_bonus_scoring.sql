-- ── 1. tournament_meta: single-row table set by admin after the final ────────
create table if not exists public.tournament_meta (
  id          int  primary key default 1,
  champion    text,
  runner_up   text,
  updated_at  timestamptz default now(),
  constraint  single_row check (id = 1)
);

-- Seed the row so it always exists
insert into public.tournament_meta (id) values (1)
  on conflict (id) do nothing;

-- RLS: admins (service role) can update; anyone can read
alter table public.tournament_meta enable row level security;
create policy "public_read_meta"  on public.tournament_meta for select using (true);

-- ── 2. Core scoring function (reads from tournament_meta + player goals) ──────
create or replace function public.auto_score_special_picks()
returns void language plpgsql security definer as $$
declare
  v_champion  text;
  v_runner_up text;
  v_max_goals int;
begin
  select champion, runner_up
  into   v_champion, v_runner_up
  from   public.tournament_meta
  where  id = 1;

  select coalesce(max(goals), 0)
  into   v_max_goals
  from   public.world_cup_football_players;

  update public.special_picks sp
  set
    champion_pts  = case when v_champion  is not null and sp.champion  = v_champion  then 100 else 0 end,
    runner_up_pts = case when v_runner_up is not null and sp.runner_up = v_runner_up then  30 else 0 end,
    top_scorer_pts = coalesce((
      select
        p.goals * 5
        + case when v_max_goals > 0 and p.goals >= v_max_goals then 50 else 0 end
      from public.world_cup_football_players p
      where p.player_name = sp.top_scorer_player
        and p.team_name   = sp.top_scorer_team
      limit 1
    ), 0);
end;
$$;

-- ── 3. Trigger: fires when champion / runner_up is set in tournament_meta ──────
create or replace function public._trg_meta_score()
returns trigger language plpgsql security definer as $$
begin
  perform public.auto_score_special_picks();
  return new;
end;
$$;

drop trigger if exists trg_meta_score on public.tournament_meta;
create trigger trg_meta_score
  after insert or update of champion, runner_up
  on public.tournament_meta
  for each row execute procedure public._trg_meta_score();

-- ── 4. Trigger: fires when any player's goals column changes ─────────────────
create or replace function public._trg_player_goals_score()
returns trigger language plpgsql security definer as $$
begin
  perform public.auto_score_special_picks();
  return new;
end;
$$;

drop trigger if exists trg_player_goals_score on public.world_cup_football_players;
create trigger trg_player_goals_score
  after update of goals
  on public.world_cup_football_players
  for each statement execute procedure public._trg_player_goals_score();

-- ── 5. Cron: runs hourly as safety net ───────────────────────────────────────
select cron.schedule(
  'auto-score-bonus-picks',
  '0 * * * *',
  $$ select public.auto_score_special_picks(); $$
);

-- ── 6. Keep score_special_picks as manual override (same logic) ──────────────
create or replace function public.score_special_picks(
  p_champion  text,
  p_runner_up text
) returns void language plpgsql security definer as $$
begin
  update public.tournament_meta
  set champion = p_champion, runner_up = p_runner_up, updated_at = now()
  where id = 1;
  -- trigger fires auto_score_special_picks automatically
end;
$$;
