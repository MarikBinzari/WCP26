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
        when r.stage = 'group' and r.pred_home = r.real_home and r.pred_away = r.real_away then 90
        when r.stage = 'group' and r.pred_result = r.real_result then 30
        when r.stage = 'r16' and r.pred_result = r.real_result and r.pred_home = r.real_home and r.pred_away = r.real_away then 40 + 20
        when r.stage = 'r16' and r.pred_result = r.real_result then 40
        when r.stage = 'qf' and r.pred_result = r.real_result and r.pred_home = r.real_home and r.pred_away = r.real_away then 60 + 30
        when r.stage = 'qf' and r.pred_result = r.real_result then 60
        when r.stage = 'sf' and r.pred_result = r.real_result and r.pred_home = r.real_home and r.pred_away = r.real_away then 90 + 40
        when r.stage = 'sf' and r.pred_result = r.real_result then 90
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
