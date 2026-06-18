-- ═══════════════════════════════════════════════════════════════════════════
-- LIVE BONUS SCORING
-- 1. Trigger pe match_events  → top_scorer_pts = goals × 5  (live per gol)
-- 2. auto_score_special_picks → citește din match_events (nu world_cup_football_players)
-- 3. Trigger pe live_scores   → finala FT → setează campioana/runner-up automat
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. TRIGGER PE match_events: live top scorer pts ──────────────────────────

create or replace function public._trg_goal_top_scorer_pts()
returns trigger language plpgsql security definer as $$
declare
  v_player text;
  v_goals  int;
begin
  if TG_OP = 'DELETE' then
    v_player := OLD.player_name;
  else
    -- Procesăm doar goluri reale (nu autogoluri)
    if NEW.type != 'Goal' or (NEW.detail is not null and NEW.detail = 'Own Goal') then
      return NEW;
    end if;
    v_player := NEW.player_name;
  end if;

  if v_player is null then
    if TG_OP = 'DELETE' then return OLD; end if;
    return NEW;
  end if;

  -- Numărăm golurile jucătorului din match_events
  select count(*) into v_goals
  from public.match_events
  where player_name = v_player
    and type = 'Goal'
    and (detail is null or detail != 'Own Goal');

  -- Actualizăm top_scorer_pts = goluri × 5 (fără +50, ăla vine la finalul turneului)
  update public.special_picks
  set top_scorer_pts = v_goals * 5
  where top_scorer_player = v_player;

  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

drop trigger if exists trg_goal_top_scorer_pts on public.match_events;
create trigger trg_goal_top_scorer_pts
  after insert or update or delete
  on public.match_events
  for each row
  execute procedure public._trg_goal_top_scorer_pts();


-- ── 2. auto_score_special_picks: citește din match_events ────────────────────
-- Schimbăm sursa de goluri din world_cup_football_players → match_events.
-- +50 bonus se aplică DOAR dacă campioana e setată (finala s-a terminat).

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

  -- Calculăm max goluri doar la final de turneu (pentru bonusul de +50)
  if v_final_done then
    select coalesce(max(cnt), 0) into v_max_goals
    from (
      select count(*) as cnt
      from public.match_events
      where type = 'Goal' and (detail is null or detail != 'Own Goal')
      group by player_name
    ) t;
  end if;

  update public.special_picks sp
  set
    champion_pts  = case
      when v_champion  is not null and sp.champion  = v_champion  then 100 else 0
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
      where me.player_name = sp.top_scorer_player
        and me.type = 'Goal'
        and (me.detail is null or me.detail != 'Own Goal')
    ), 0);
end;
$$;


-- ── 3. TRIGGER PE live_scores: finala FT → campioană + runner-up automat ─────

create or replace function public._trg_final_ft_bonus()
returns trigger language plpgsql security definer as $$
declare
  v_stage     text;
  v_home_name text;
  v_away_name text;
  v_champion  text;
  v_runner_up text;
begin
  -- Procesăm doar tranziția către FT (nu și actualizări ulterioare)
  if NEW.status != 'FT' or OLD.status = 'FT' then
    return NEW;
  end if;

  -- Verificăm dacă e meciul final
  select m.stage, t1.name, t2.name
  into   v_stage, v_home_name, v_away_name
  from public.matches m
  join public.teams t1 on t1.id = m.team1_id
  join public.teams t2 on t2.id = m.team2_id
  where m.match_key = NEW.match_key;

  -- Nu e finala → ieșim
  if v_stage is null or v_stage not in ('final', 'UCL Final') then
    return NEW;
  end if;

  -- Determinăm câștigătorul
  if NEW.penalty_home_score is not null and NEW.penalty_away_score is not null then
    -- S-a jucat la penalty-uri
    if NEW.penalty_home_score > NEW.penalty_away_score then
      v_champion  := v_home_name;
      v_runner_up := v_away_name;
    else
      v_champion  := v_away_name;
      v_runner_up := v_home_name;
    end if;
  else
    -- Regular time sau extra time
    if coalesce(NEW.regular_time_home_score, 0) > coalesce(NEW.regular_time_away_score, 0) then
      v_champion  := v_home_name;
      v_runner_up := v_away_name;
    else
      v_champion  := v_away_name;
      v_runner_up := v_home_name;
    end if;
  end if;

  -- Setăm în tournament_meta → triggerul existent declanșează auto_score_special_picks()
  -- care calculează champion_pts (100p) + runner_up_pts (30p) + top_scorer_pts + 50p bonus
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
  after update of status
  on public.live_scores
  for each row
  execute procedure public._trg_final_ft_bonus();
