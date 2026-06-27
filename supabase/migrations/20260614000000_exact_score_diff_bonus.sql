-- Add goal difference bonus (+15 pts) to exact score scoring.
-- Applied to all tournament stages retroactively.
-- Logic: correct outcome + correct goal difference (but not exact score) → result + diff_bonus

-- ── 1. Scoring rules — add diff_bonus per stage ────────────────────────────
insert into public.scoring_rules (type, phase, points, sort_order) values
  ('exact_score', 'group_diff_bonus', 10, 13),
  ('exact_score', 'r32_diff_bonus',   10, 14),
  ('exact_score', 'r16_diff_bonus',   10, 15),
  ('exact_score', 'qf_diff_bonus',    10, 16),
  ('exact_score', 'sf_diff_bonus',    10, 17),
  ('exact_score', 'final_diff_bonus', 10, 18)
on conflict (type, phase) do update set points = excluded.points;

-- ── 2. Recreate score_exact_picks() with diff bonus logic ──────────────────
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
declare
  v_group_result      int;
  v_group_diff_bonus  int;
  v_group_exact       int;
  v_r32_result        int;
  v_r32_diff_bonus    int;
  v_r32_exact_bonus   int;
  v_r16_result        int;
  v_r16_diff_bonus    int;
  v_r16_exact_bonus   int;
  v_qf_result         int;
  v_qf_diff_bonus     int;
  v_qf_exact_bonus    int;
  v_sf_result         int;
  v_sf_diff_bonus     int;
  v_sf_exact_bonus    int;
  v_final_result      int;
  v_final_diff_bonus  int;
  v_final_exact_bonus int;
begin
  select points into strict v_group_result      from public.scoring_rules where type='exact_score' and phase='group_result';
  select points into strict v_group_diff_bonus  from public.scoring_rules where type='exact_score' and phase='group_diff_bonus';
  select points into strict v_group_exact       from public.scoring_rules where type='exact_score' and phase='group_exact';
  select points into strict v_r32_result        from public.scoring_rules where type='exact_score' and phase='r32_result';
  select points into strict v_r32_diff_bonus    from public.scoring_rules where type='exact_score' and phase='r32_diff_bonus';
  select points into strict v_r32_exact_bonus   from public.scoring_rules where type='exact_score' and phase='r32_exact_bonus';
  select points into strict v_r16_result        from public.scoring_rules where type='exact_score' and phase='r16_result';
  select points into strict v_r16_diff_bonus    from public.scoring_rules where type='exact_score' and phase='r16_diff_bonus';
  select points into strict v_r16_exact_bonus   from public.scoring_rules where type='exact_score' and phase='r16_exact_bonus';
  select points into strict v_qf_result         from public.scoring_rules where type='exact_score' and phase='qf_result';
  select points into strict v_qf_diff_bonus     from public.scoring_rules where type='exact_score' and phase='qf_diff_bonus';
  select points into strict v_qf_exact_bonus    from public.scoring_rules where type='exact_score' and phase='qf_exact_bonus';
  select points into strict v_sf_result         from public.scoring_rules where type='exact_score' and phase='sf_result';
  select points into strict v_sf_diff_bonus     from public.scoring_rules where type='exact_score' and phase='sf_diff_bonus';
  select points into strict v_sf_exact_bonus    from public.scoring_rules where type='exact_score' and phase='sf_exact_bonus';
  select points into strict v_final_result      from public.scoring_rules where type='exact_score' and phase='final_result';
  select points into strict v_final_diff_bonus  from public.scoring_rules where type='exact_score' and phase='final_diff_bonus';
  select points into strict v_final_exact_bonus from public.scoring_rules where type='exact_score' and phase='final_exact_bonus';

  return query
  with results as (
    select
      es.user_id,
      es.board_id,
      m.match_key,
      m.stage,
      es.team1_score as pred_home,
      es.team2_score as pred_away,
      ls.regular_time_home_score as real_home,
      ls.regular_time_away_score as real_away,
      case when es.team1_score > es.team2_score then 'H'
           when es.team1_score < es.team2_score then 'A'
           else 'D' end as pred_result,
      case when ls.regular_time_home_score > ls.regular_time_away_score then 'H'
           when ls.regular_time_home_score < ls.regular_time_away_score then 'A'
           else 'D' end as real_result
    from exact_scores es
    join matches m on m.id = es.match_id
    join live_scores ls on ls.match_key = m.match_key
    where ls.status = 'FT'
      and ls.regular_time_home_score is not null
      and ls.regular_time_away_score is not null
  ),
  scored as (
    select
      r.*,
      case
        -- ── GROUP ────────────────────────────────────────────────────────────
        when r.stage = 'group'
          and r.pred_home = r.real_home and r.pred_away = r.real_away
          then v_group_exact
        when r.stage = 'group'
          and r.pred_result = r.real_result
          and r.pred_result <> 'D'
          and (r.pred_home - r.pred_away) = (r.real_home - r.real_away)
          then v_group_result + v_group_diff_bonus
        when r.stage = 'group'
          and r.pred_result = r.real_result
          then v_group_result
        -- ── R32 ──────────────────────────────────────────────────────────────
        when r.stage = 'r32'
          and r.pred_result = r.real_result
          and r.pred_home = r.real_home and r.pred_away = r.real_away
          then v_r32_result + v_r32_exact_bonus
        when r.stage = 'r32'
          and r.pred_result = r.real_result
          and r.pred_result <> 'D'
          and (r.pred_home - r.pred_away) = (r.real_home - r.real_away)
          then v_r32_result + v_r32_diff_bonus
        when r.stage = 'r32'
          and r.pred_result = r.real_result
          then v_r32_result
        -- ── R16 ──────────────────────────────────────────────────────────────
        when r.stage = 'r16'
          and r.pred_result = r.real_result
          and r.pred_home = r.real_home and r.pred_away = r.real_away
          then v_r16_result + v_r16_exact_bonus
        when r.stage = 'r16'
          and r.pred_result = r.real_result
          and r.pred_result <> 'D'
          and (r.pred_home - r.pred_away) = (r.real_home - r.real_away)
          then v_r16_result + v_r16_diff_bonus
        when r.stage = 'r16'
          and r.pred_result = r.real_result
          then v_r16_result
        -- ── QF ───────────────────────────────────────────────────────────────
        when r.stage = 'qf'
          and r.pred_result = r.real_result
          and r.pred_home = r.real_home and r.pred_away = r.real_away
          then v_qf_result + v_qf_exact_bonus
        when r.stage = 'qf'
          and r.pred_result = r.real_result
          and r.pred_result <> 'D'
          and (r.pred_home - r.pred_away) = (r.real_home - r.real_away)
          then v_qf_result + v_qf_diff_bonus
        when r.stage = 'qf'
          and r.pred_result = r.real_result
          then v_qf_result
        -- ── SF ───────────────────────────────────────────────────────────────
        when r.stage = 'sf'
          and r.pred_result = r.real_result
          and r.pred_home = r.real_home and r.pred_away = r.real_away
          then v_sf_result + v_sf_exact_bonus
        when r.stage = 'sf'
          and r.pred_result = r.real_result
          and r.pred_result <> 'D'
          and (r.pred_home - r.pred_away) = (r.real_home - r.real_away)
          then v_sf_result + v_sf_diff_bonus
        when r.stage = 'sf'
          and r.pred_result = r.real_result
          then v_sf_result
        -- ── FINAL & UCL ───────────────────────────────────────────────────────
        when r.stage in ('final', 'UCL Final')
          and r.pred_result = r.real_result
          and r.pred_home = r.real_home and r.pred_away = r.real_away
          then v_final_result + v_final_exact_bonus
        when r.stage in ('final', 'UCL Final')
          and r.pred_result = r.real_result
          and r.pred_result <> 'D'
          and (r.pred_home - r.pred_away) = (r.real_home - r.real_away)
          then v_final_result + v_final_diff_bonus
        when r.stage in ('final', 'UCL Final')
          and r.pred_result = r.real_result
          then v_final_result
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

-- ── Preview (fără modificări): select * from score_exact_picks();
-- ── Aplică retroactiv:         select apply_exact_scores();
