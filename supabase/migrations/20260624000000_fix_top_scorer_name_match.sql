-- Fix: match abbreviated event names ("C. Ronaldo") to full pick names ("Cristiano Ronaldo")
-- Root cause: squad API returns full names, events API returns abbreviated names

-- ── 1. Helper: returns true if abbreviated matches full name ─────────────────
create or replace function public._names_match(abbreviated text, full_name text)
returns boolean language sql immutable as $$
  select
    abbreviated = full_name  -- exact match
    or (
      -- abbreviated format "X. Surname" matches "Firstname Surname"
      abbreviated like '%. %'
      and left(full_name, 1) = left(abbreviated, 1)
      and full_name ilike '%' || split_part(abbreviated, '. ', 2)
    )
    or (
      -- reverse: full_name might be the abbreviated form
      full_name like '%. %'
      and left(abbreviated, 1) = left(full_name, 1)
      and abbreviated ilike '%' || split_part(full_name, '. ', 2)
    )
$$;

-- ── 2. Rebuild trigger: uses _names_match for both count and update ──────────
create or replace function public._trg_goal_top_scorer_pts()
returns trigger language plpgsql security definer as $$
declare
  v_player text;
  v_goals  int;
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

  -- Count all goals matching this player (exact OR abbreviated)
  select count(*) into v_goals
  from public.match_events
  where public._names_match(player_name, v_player)
    and type = 'Goal'
    and (detail is null or detail != 'Own Goal');

  -- Update picks where stored name matches (exact OR abbreviated)
  update public.special_picks
  set top_scorer_pts = v_goals * 5
  where public._names_match(v_player, top_scorer_player);

  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

-- ── 3. Rebuild auto_score_special_picks: same name matching ─────────────────
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
      where public._names_match(me.player_name, sp.top_scorer_player)
        and me.type = 'Goal'
        and (me.detail is null or me.detail != 'Own Goal')
    ), 0);
end;
$$;

-- ── 4. Retroactive fix: recalculate top_scorer_pts for all existing picks ───
select public.auto_score_special_picks();
