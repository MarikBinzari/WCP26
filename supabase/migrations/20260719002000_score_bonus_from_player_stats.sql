-- API-Football player stats are now the authoritative source for scorer
-- goals/assists. Use them for special-pick top-scorer scoring too.

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
    select coalesce(max(goals), 0)
    into v_max_goals
    from public.world_cup_football_players
    where api_football_id is not null;
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
        p.goals * 5
        + case
            when v_final_done and v_max_goals > 0 and p.goals >= v_max_goals
            then 50 else 0
          end
      from public.world_cup_football_players p
      where public._names_match(p.player_name, sp.top_scorer_player)
        and (sp.top_scorer_team is null or p.team_name = sp.top_scorer_team)
      order by p.goals desc, p.assists desc
      limit 1
    ), 0)
  where true;
end;
$$;

select public.auto_score_special_picks();
