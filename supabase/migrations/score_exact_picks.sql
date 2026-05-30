-- ─────────────────────────────────────────────────────────────────────────────
-- score_exact_picks()
-- Calculează punctele pentru exact score predictions și actualizează board_scores.
-- Rulează DUPĂ ce live_scores are status='FT' pentru meciurile jucate.
--
-- Logica:
--   group stage  → scor exact: 90 pts | rezultat corect: 30 pts
--   r16          → câștigător corect: 40 pts
--   qf           → câștigător corect: 60 pts
--   sf           → câștigător corect: 90 pts
--   final/UCL    → câștigător corect: 120 pts | scor exact: +50 pts bonus
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.score_exact_picks()
returns table(
  user_id     uuid,
  board_id    text,
  match_key   text,
  stage       text,
  predicted   text,
  actual      text,
  pts         int
)
language plpgsql security definer as $$
begin
  return query
  with results as (
    select
      es.user_id,
      es.board_id,
      m.match_key,
      m.stage,
      es.team1_score  as pred_home,
      es.team2_score  as pred_away,
      ls.home_score   as real_home,
      ls.away_score   as real_away,
      -- Rezultat prezis
      case when es.team1_score > es.team2_score then 'H'
           when es.team1_score < es.team2_score then 'A'
           else 'D' end as pred_result,
      -- Rezultat real
      case when ls.home_score > ls.away_score then 'H'
           when ls.home_score < ls.away_score then 'A'
           else 'D' end as real_result
    from exact_scores es
    join matches m on m.id = es.match_id
    join live_scores ls on ls.match_key = m.match_key
    where ls.status = 'FT'
      and ls.home_score is not null
      and ls.away_score is not null
  ),
  scored as (
    select
      r.*,
      case
        -- Group stage: scor exact = 90, rezultat corect = 30
        when r.stage = 'group' and r.pred_home = r.real_home and r.pred_away = r.real_away then 90
        when r.stage = 'group' and r.pred_result = r.real_result then 30
        -- Round of 16: câștigător + bonus scor exact
        when r.stage = 'r16' and r.pred_result = r.real_result and r.pred_home = r.real_home and r.pred_away = r.real_away then 40 + 20
        when r.stage = 'r16' and r.pred_result = r.real_result then 40
        -- QF
        when r.stage = 'qf' and r.pred_result = r.real_result and r.pred_home = r.real_home and r.pred_away = r.real_away then 60 + 30
        when r.stage = 'qf' and r.pred_result = r.real_result then 60
        -- SF
        when r.stage = 'sf' and r.pred_result = r.real_result and r.pred_home = r.real_home and r.pred_away = r.real_away then 90 + 40
        when r.stage = 'sf' and r.pred_result = r.real_result then 90
        -- Final / UCL Final: câștigător 120 pts, scor exact bonus +50
        when r.stage in ('final', 'UCL Final') and r.pred_result = r.real_result and r.pred_home = r.real_home and r.pred_away = r.real_away then 120 + 50
        when r.stage in ('final', 'UCL Final') and r.pred_result = r.real_result then 120
        else 0
      end as pts_earned
    from results r
  )
  select
    s.user_id,
    s.board_id,
    s.match_key,
    s.stage,
    s.pred_home || '-' || s.pred_away as predicted,
    s.real_home || '-' || s.real_away as actual,
    s.pts_earned
  from scored s
  where s.pts_earned > 0;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- apply_exact_scores()
-- Aplică rezultatele din score_exact_picks() în board_scores.
-- Rulează o singură dată după meci sau după fiecare meci important.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.apply_exact_scores()
returns void language plpgsql security definer as $$
begin
  -- Calculează punctele și agregă per (user, board)
  with pts_per_user as (
    select user_id, board_id, sum(pts) as earned
    from public.score_exact_picks()
    group by user_id, board_id
  )
  insert into board_scores (user_id, board_id, exact_pts, pred_pts, total_pts, updated_at)
  select
    p.user_id,
    p.board_id,
    p.earned,
    0,
    p.earned,
    now()
  from pts_per_user p
  on conflict (user_id, board_id) do update
    set exact_pts = excluded.exact_pts,
        total_pts = board_scores.pred_pts + excluded.exact_pts,
        updated_at = now();
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Preview: ce puncte ar primi fiecare user dacă s-ar rula acum
-- (fără să modifice nimic în DB)
-- select * from score_exact_picks();
--
-- Aplică efectiv punctele:
-- select apply_exact_scores();
-- ─────────────────────────────────────────────────────────────────────────────
