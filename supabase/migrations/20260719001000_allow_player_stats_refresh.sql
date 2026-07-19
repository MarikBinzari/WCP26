-- Player stats now refresh from API-Football into world_cup_football_players.
-- Bonus top-scorer scoring is driven by match_events, so this old trigger is
-- obsolete and blocks bulk stat refreshes through safe-update protection.
drop trigger if exists trg_player_goals_score on public.world_cup_football_players;

create or replace function public.auto_score_special_picks()
returns void language plpgsql security definer as $$
declare
  v_champion   text;
  v_runner_up  text;
  v_max_goals  int := 0;
  v_final_done boolean := false;
begin
  select champion, runner_up
  into   v_champion, v_runner_up
  from   public.tournament_meta
  where  id = 1;

  v_final_done := (v_champion is not null);

  if v_final_done then
    select coalesce(max(cnt), 0) into v_max_goals
    from (
      select count(*) as cnt
      from public.match_events
      where type = 'Goal'
        and (detail is null or detail not in ('Own Goal', 'Missed Penalty'))
      group by player_name
    ) t;
  end if;

  update public.special_picks sp
  set
    champion_pts = case
      when v_champion is not null and sp.champion = v_champion then 100 else 0
    end,
    runner_up_pts = case
      when v_runner_up is not null and sp.runner_up = v_runner_up then 30 else 0
    end,
    top_scorer_pts = coalesce((
      select
        count(*) * 5
        + case
            when v_final_done and v_max_goals > 0 and count(*) >= v_max_goals
            then 50 else 0
          end
      from public.match_events me
      where public._names_match(me.player_name, sp.top_scorer_player)
        and me.type = 'Goal'
        and (me.detail is null or me.detail not in ('Own Goal', 'Missed Penalty'))
    ), 0)
  where true;
end;
$$;
