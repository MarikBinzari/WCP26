-- ─────────────────────────────────────────────────────────────────────────────
-- get_leaderboard — adaugă user_id și avatar_url
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.get_leaderboard(
  p_board_id text,
  p_search   text default null
)
returns table(user_id uuid, display_name text, total_pts integer, avatar_url text)
language plpgsql security definer as $function$
begin
  if p_board_id = 'global' then
    if p_search is not null and p_search <> '' then
      return query
        select p.id, p.display_name,
          (coalesce(bs.total_pts,0)+coalesce(sp.champion_pts+sp.top_scorer_pts,0))::integer,
          p.avatar_url
        from profiles p
        left join board_scores bs on bs.user_id=p.id and bs.board_id='global'
        left join special_picks sp on sp.user_id=p.id and sp.board_id='global'
        where p.display_name ilike '%'||p_search||'%'
        order by 3 desc;
    else
      return query
        select p.id, p.display_name,
          (coalesce(bs.total_pts,0)+coalesce(sp.champion_pts+sp.top_scorer_pts,0))::integer,
          p.avatar_url
        from profiles p
        left join board_scores bs on bs.user_id=p.id and bs.board_id='global'
        left join special_picks sp on sp.user_id=p.id and sp.board_id='global'
        order by 3 desc limit 500;
    end if;
  else
    if p_search is not null and p_search <> '' then
      return query
        select p.id, p.display_name,
          (coalesce(bs.total_pts,0)+coalesce(sp.champion_pts+sp.top_scorer_pts,0))::integer,
          p.avatar_url
        from board_members bm
        join profiles p on p.id=bm.user_id
        left join board_scores bs on bs.user_id=bm.user_id and bs.board_id=p_board_id
        left join special_picks sp on sp.user_id=bm.user_id and sp.board_id=p_board_id
        where bm.board_id::text=p_board_id
          and p.display_name ilike '%'||p_search||'%'
        order by 3 desc;
    else
      return query
        select p.id, p.display_name,
          (coalesce(bs.total_pts,0)+coalesce(sp.champion_pts+sp.top_scorer_pts,0))::integer,
          p.avatar_url
        from board_members bm
        join profiles p on p.id=bm.user_id
        left join board_scores bs on bs.user_id=bm.user_id and bs.board_id=p_board_id
        left join special_picks sp on sp.user_id=bm.user_id and sp.board_id=p_board_id
        where bm.board_id::text=p_board_id
        order by 3 desc limit 500;
    end if;
  end if;
end;
$function$;

-- ─────────────────────────────────────────────────────────────────────────────
-- get_user_group_breakdown — grupe unde userul a câștigat puncte
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.get_user_group_breakdown(
  p_user_id  uuid,
  p_board_id text
)
returns table(
  group_id text,
  hit_1st  text,   -- echipa dacă poziția 1 corectă, altfel null
  hit_2nd  text,
  hit_3rd  text,
  pts      int
)
language sql security definer as $$
  with
  user_pred as (
    select group_rankings from public.predictions
    where user_id=p_user_id and board_id=p_board_id limit 1
  ),
  actual_pivot as (
    select group_id,
      max(case when rank=1 then team_name end) as a1,
      max(case when rank=2 then team_name end) as a2,
      max(case when rank=3 then team_name end) as a3
    from public.get_group_standings()
    group by group_id
  ),
  sc as (
    select
      max(case when phase='group1st' then points else 0 end) as p1,
      max(case when phase='group2nd' then points else 0 end) as p2,
      max(case when phase='group3rd' then points else 0 end) as p3
    from public.scoring_rules where type='prediction'
  ),
  result as (
    select
      ap.group_id,
      case when (up.group_rankings->ap.group_id->>0)=ap.a1 then ap.a1 else null end as hit_1st,
      case when (up.group_rankings->ap.group_id->>1)=ap.a2 then ap.a2 else null end as hit_2nd,
      case when (up.group_rankings->ap.group_id->>2)=ap.a3 then ap.a3 else null end as hit_3rd,
      (
        case when (up.group_rankings->ap.group_id->>0)=ap.a1 then sc.p1 else 0 end +
        case when (up.group_rankings->ap.group_id->>1)=ap.a2 then sc.p2 else 0 end +
        case when (up.group_rankings->ap.group_id->>2)=ap.a3 then sc.p3 else 0 end
      )::int as pts
    from actual_pivot ap cross join user_pred up cross join sc
    where up.group_rankings ? ap.group_id
  )
  select group_id, hit_1st, hit_2nd, hit_3rd, pts
  from result where pts > 0
  order by group_id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- get_user_exact_breakdown — meciuri unde userul a câștigat puncte (pts > 0)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.get_user_exact_breakdown(
  p_user_id  uuid,
  p_board_id text
)
returns table(
  match_key   text, stage text,
  home_team   text, away_team   text,
  pred_home   int,  pred_away   int,
  actual_home int,  actual_away int,
  pts         int
)
language plpgsql security definer as $func$
declare
  v_gr int; v_ge int;
  v_r32r int; v_r32b int; v_r16r int; v_r16b int;
  v_qfr  int; v_qfb  int; v_sfr  int; v_sfb  int;
  v_fr   int; v_fb   int;
begin
  select points into v_gr   from public.scoring_rules where type='exact_score' and phase='group_result';
  select points into v_ge   from public.scoring_rules where type='exact_score' and phase='group_exact';
  select points into v_r32r from public.scoring_rules where type='exact_score' and phase='r32_result';
  select points into v_r32b from public.scoring_rules where type='exact_score' and phase='r32_exact_bonus';
  select points into v_r16r from public.scoring_rules where type='exact_score' and phase='r16_result';
  select points into v_r16b from public.scoring_rules where type='exact_score' and phase='r16_exact_bonus';
  select points into v_qfr  from public.scoring_rules where type='exact_score' and phase='qf_result';
  select points into v_qfb  from public.scoring_rules where type='exact_score' and phase='qf_exact_bonus';
  select points into v_sfr  from public.scoring_rules where type='exact_score' and phase='sf_result';
  select points into v_sfb  from public.scoring_rules where type='exact_score' and phase='sf_exact_bonus';
  select points into v_fr   from public.scoring_rules where type='exact_score' and phase='final_result';
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
        when m.stage='group' and es.team1_score=ls.regular_time_home_score and es.team2_score=ls.regular_time_away_score then v_ge
        when m.stage='group' and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score) then v_gr
        when m.stage='r32' and es.team1_score=ls.regular_time_home_score and es.team2_score=ls.regular_time_away_score then v_r32r+v_r32b
        when m.stage='r32' and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score) then v_r32r
        when m.stage='r16' and es.team1_score=ls.regular_time_home_score and es.team2_score=ls.regular_time_away_score then v_r16r+v_r16b
        when m.stage='r16' and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score) then v_r16r
        when m.stage='qf' and es.team1_score=ls.regular_time_home_score and es.team2_score=ls.regular_time_away_score then v_qfr+v_qfb
        when m.stage='qf' and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score) then v_qfr
        when m.stage='sf' and es.team1_score=ls.regular_time_home_score and es.team2_score=ls.regular_time_away_score then v_sfr+v_sfb
        when m.stage='sf' and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score) then v_sfr
        when m.stage in ('final','UCL Final') and es.team1_score=ls.regular_time_home_score and es.team2_score=ls.regular_time_away_score then v_fr+v_fb
        when m.stage in ('final','UCL Final') and sign(es.team1_score-es.team2_score)=sign(ls.regular_time_home_score-ls.regular_time_away_score) then v_fr
        else 0
      end as match_pts
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
    scored.match_pts as pts
  from scored where scored.match_pts > 0
  order by scored.match_key;
end;
$func$;
