-- Finala mica must not award final/champion bonus points.
-- 48-0 is the third-place match; 49-0 is the tournament final.

alter table public.matches
  drop constraint if exists matches_stage_check;

alter table public.matches
  add constraint matches_stage_check
  check (stage = any (array[
    'group'::text,
    'r32'::text,
    'r16'::text,
    'qf'::text,
    'sf'::text,
    'final'::text,
    'third_place'::text,
    'UCL Final'::text
  ]));

update public.matches
set stage = 'third_place'
where match_key = '48-0';

create or replace function public._trg_final_ft_bonus()
returns trigger language plpgsql security definer as $$
declare
  v_home_name text;
  v_away_name text;
  v_champion  text;
  v_runner_up text;
  v_home_score int;
  v_away_score int;
begin
  if NEW.status != 'FT' or NEW.match_key != '49-0' then
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

  select t1.name, t2.name
  into   v_home_name, v_away_name
  from public.matches m
  join public.teams t1 on t1.id = m.team1_id
  join public.teams t2 on t2.id = m.team2_id
  where m.match_key = '49-0';

  if v_home_name is null or v_away_name is null then
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
