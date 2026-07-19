-- Harden final bonus scoring for the end-of-tournament flow.
-- Covers direct FT inserts, score corrections after FT, and goals added after
-- tournament_meta has already been set.

create or replace function public._trg_goal_top_scorer_pts()
returns trigger language plpgsql security definer as $$
declare
  v_player text;
  v_goals  int;
  v_final_done boolean := false;
begin
  if TG_OP = 'DELETE' then
    v_player := OLD.player_name;
  else
    if NEW.type != 'Goal' or (NEW.detail is not null and NEW.detail = 'Own Goal') then
      return NEW;
    end if;
    v_player := NEW.player_name;
  end if;

  if v_player is null then
    if TG_OP = 'DELETE' then return OLD; end if;
    return NEW;
  end if;

  select exists (
    select 1
    from public.tournament_meta
    where id = 1 and champion is not null
  ) into v_final_done;

  if v_final_done then
    perform public.auto_score_special_picks();
  else
    select count(*) into v_goals
    from public.match_events
    where public._names_match(player_name, v_player)
      and type = 'Goal'
      and (detail is null or detail != 'Own Goal');

    update public.special_picks
    set top_scorer_pts = v_goals * 5
    where public._names_match(v_player, top_scorer_player);
  end if;

  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

create or replace function public._trg_final_ft_bonus()
returns trigger language plpgsql security definer as $$
declare
  v_stage     text;
  v_home_name text;
  v_away_name text;
  v_champion  text;
  v_runner_up text;
  v_home_score int;
  v_away_score int;
begin
  if NEW.status != 'FT' then
    return NEW;
  end if;

  if TG_OP = 'UPDATE'
     and OLD.status = 'FT'
     and OLD.regular_time_home_score is not distinct from NEW.regular_time_home_score
     and OLD.regular_time_away_score is not distinct from NEW.regular_time_away_score
     and OLD.penalty_home_score is not distinct from NEW.penalty_home_score
     and OLD.penalty_away_score is not distinct from NEW.penalty_away_score then
    return NEW;
  end if;

  select m.stage, t1.name, t2.name
  into   v_stage, v_home_name, v_away_name
  from public.matches m
  join public.teams t1 on t1.id = m.team1_id
  join public.teams t2 on t2.id = m.team2_id
  where m.match_key = NEW.match_key;

  if v_stage is null or v_stage not in ('final', 'UCL Final') then
    return NEW;
  end if;

  v_home_score := coalesce(NEW.penalty_home_score, NEW.regular_time_home_score);
  v_away_score := coalesce(NEW.penalty_away_score, NEW.regular_time_away_score);

  if v_home_score is null or v_away_score is null or v_home_score = v_away_score then
    return NEW;
  end if;

  if v_home_score > v_away_score then
    v_champion  := v_home_name;
    v_runner_up := v_away_name;
  else
    v_champion  := v_away_name;
    v_runner_up := v_home_name;
  end if;

  update public.tournament_meta
  set champion   = v_champion,
      runner_up  = v_runner_up,
      updated_at = now()
  where id = 1;

  return NEW;
end;
$$;

drop trigger if exists trg_final_ft_bonus on public.live_scores;
create trigger trg_final_ft_bonus
  after insert or update of status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score
  on public.live_scores
  for each row
  execute procedure public._trg_final_ft_bonus();

select public.auto_score_special_picks();
