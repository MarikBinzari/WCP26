-- Recreate get_user_exact_breakdown with diff bonus logic, reading from scoring_rules.
-- Also adds a `label` column ('exact'/'diff'/'result') for UI badge display.
-- DROP first because return type changes (new label column).

drop function if exists public.get_user_exact_breakdown(uuid, text);

create or replace function public.get_user_exact_breakdown(
  p_user_id  uuid,
  p_board_id text
)
returns table(
  match_key   text, stage       text,
  home_team   text, away_team   text,
  pred_home   int,  pred_away   int,
  actual_home int,  actual_away int,
  pts         int,  label       text
)
language plpgsql security definer as $func$
declare
  v_gr   int; v_gr_d int; v_ge  int;
  v_r32r int; v_r32d int; v_r32b int;
  v_r16r int; v_r16d int; v_r16b int;
  v_qfr  int; v_qfd  int; v_qfb  int;
  v_sfr  int; v_sfd  int; v_sfb  int;
  v_fr   int; v_fd   int; v_fb  int;
begin
  select points into v_gr   from public.scoring_rules where type='exact_score' and phase='group_result';
  select points into v_gr_d from public.scoring_rules where type='exact_score' and phase='group_diff_bonus';
  select points into v_ge   from public.scoring_rules where type='exact_score' and phase='group_exact';
  select points into v_r32r from public.scoring_rules where type='exact_score' and phase='r32_result';
  select points into v_r32d from public.scoring_rules where type='exact_score' and phase='r32_diff_bonus';
  select points into v_r32b from public.scoring_rules where type='exact_score' and phase='r32_exact_bonus';
  select points into v_r16r from public.scoring_rules where type='exact_score' and phase='r16_result';
  select points into v_r16d from public.scoring_rules where type='exact_score' and phase='r16_diff_bonus';
  select points into v_r16b from public.scoring_rules where type='exact_score' and phase='r16_exact_bonus';
  select points into v_qfr  from public.scoring_rules where type='exact_score' and phase='qf_result';
  select points into v_qfd  from public.scoring_rules where type='exact_score' and phase='qf_diff_bonus';
  select points into v_qfb  from public.scoring_rules where type='exact_score' and phase='qf_exact_bonus';
  select points into v_sfr  from public.scoring_rules where type='exact_score' and phase='sf_result';
  select points into v_sfd  from public.scoring_rules where type='exact_score' and phase='sf_diff_bonus';
  select points into v_sfb  from public.scoring_rules where type='exact_score' and phase='sf_exact_bonus';
  select points into v_fr   from public.scoring_rules where type='exact_score' and phase='final_result';
  select points into v_fd   from public.scoring_rules where type='exact_score' and phase='final_diff_bonus';
  select points into v_fb   from public.scoring_rules where type='exact_score' and phase='final_exact_bonus';

  return query
  with scored as (
    select
      m.match_key, m.stage,
      t1.name as home_team, t2.name as away_team,
      es.team1_score as pred_home, es.team2_score as pred_away,
      ls.regular_time_home_score as actual_home,
      ls.regular_time_away_score as actual_away,
      case
        -- ── GROUP ────────────────────────────────────────────────────────────
        when m.stage='group'
          and es.team1_score=ls.regular_time_home_score
          and es.team2_score=ls.regular_time_away_score
          then v_ge
        when m.stage='group'
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          and sign(es.team1_score-es.team2_score)<>0
          and (es.team1_score-es.team2_score)=(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_gr+v_gr_d
        when m.stage='group'
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_gr
        -- ── R32 ──────────────────────────────────────────────────────────────
        when m.stage='r32'
          and es.team1_score=ls.regular_time_home_score
          and es.team2_score=ls.regular_time_away_score
          then v_r32r+v_r32b
        when m.stage='r32'
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          and sign(es.team1_score-es.team2_score)<>0
          and (es.team1_score-es.team2_score)=(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_r32r+v_r32d
        when m.stage='r32'
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_r32r
        -- ── R16 ──────────────────────────────────────────────────────────────
        when m.stage='r16'
          and es.team1_score=ls.regular_time_home_score
          and es.team2_score=ls.regular_time_away_score
          then v_r16r+v_r16b
        when m.stage='r16'
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          and sign(es.team1_score-es.team2_score)<>0
          and (es.team1_score-es.team2_score)=(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_r16r+v_r16d
        when m.stage='r16'
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_r16r
        -- ── QF ───────────────────────────────────────────────────────────────
        when m.stage='qf'
          and es.team1_score=ls.regular_time_home_score
          and es.team2_score=ls.regular_time_away_score
          then v_qfr+v_qfb
        when m.stage='qf'
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          and sign(es.team1_score-es.team2_score)<>0
          and (es.team1_score-es.team2_score)=(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_qfr+v_qfd
        when m.stage='qf'
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_qfr
        -- ── SF ───────────────────────────────────────────────────────────────
        when m.stage='sf'
          and es.team1_score=ls.regular_time_home_score
          and es.team2_score=ls.regular_time_away_score
          then v_sfr+v_sfb
        when m.stage='sf'
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          and sign(es.team1_score-es.team2_score)<>0
          and (es.team1_score-es.team2_score)=(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_sfr+v_sfd
        when m.stage='sf'
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_sfr
        -- ── FINAL & UCL ───────────────────────────────────────────────────────
        when m.stage in ('final','UCL Final')
          and es.team1_score=ls.regular_time_home_score
          and es.team2_score=ls.regular_time_away_score
          then v_fr+v_fb
        when m.stage in ('final','UCL Final')
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          and sign(es.team1_score-es.team2_score)<>0
          and (es.team1_score-es.team2_score)=(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_fr+v_fd
        when m.stage in ('final','UCL Final')
          and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          then v_fr
        else 0
      end as match_pts,
      case
        when es.team1_score=ls.regular_time_home_score
          and es.team2_score=ls.regular_time_away_score
          then 'exact'
        when sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score)
          and sign(es.team1_score-es.team2_score)<>0
          and (es.team1_score-es.team2_score)=(ls.regular_time_home_score-ls.regular_time_away_score)
          then 'diff'
        else 'result'
      end as match_label
    from public.exact_scores es
    join public.matches     m  on m.id  = es.match_id
    join public.teams       t1 on t1.id = m.team1_id
    join public.teams       t2 on t2.id = m.team2_id
    join public.live_scores ls on ls.match_key = m.match_key
    where es.user_id  = p_user_id
      and es.board_id = p_board_id
      and ls.status   = 'FT'
      and ls.regular_time_home_score is not null
      and ls.regular_time_away_score is not null
  )
  select distinct on (scored.match_key)
    scored.match_key, scored.stage,
    scored.home_team, scored.away_team,
    scored.pred_home, scored.pred_away,
    scored.actual_home, scored.actual_away,
    scored.match_pts as pts,
    scored.match_label as label
  from scored where scored.match_pts > 0
  order by scored.match_key;
end;
$func$;
