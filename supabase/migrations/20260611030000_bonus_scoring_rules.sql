-- Add runner_up scoring column
alter table public.special_picks
  add column if not exists runner_up_pts int not null default 0;

-- Rewrite score_special_picks with new rules:
--   Champion  : 100 pts if exact match
--   Runner-up : 30  pts if exact match
--   Top Scorer: 5 pts × player goals
--              +50 pts bonus if player's goals = tournament max goals (ties ALL share bonus)
--
-- Usage: select score_special_picks('Argentina', 'France');
create or replace function public.score_special_picks(
  p_champion  text,
  p_runner_up text
) returns void language plpgsql security definer as $$
declare
  v_max_goals int;
begin
  select coalesce(max(goals), 0)
  into v_max_goals
  from public.world_cup_football_players;

  update public.special_picks sp
  set
    champion_pts  = case when sp.champion  = p_champion  then 100 else 0 end,
    runner_up_pts = case when sp.runner_up = p_runner_up then  30 else 0 end,
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

-- Update helper view to include runner_up_pts
create or replace view public.special_pick_pts as
  select
    user_id,
    board_id,
    (champion_pts + runner_up_pts + top_scorer_pts) as pts
  from public.special_picks;
