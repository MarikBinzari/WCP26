drop function if exists public.get_user_ko_breakdown(uuid, text);
drop function if exists public.get_user_ko_hits(uuid, text);

create or replace function public.get_user_ko_hits(
  p_user_id  uuid,
  p_board_id text
)
returns table(round text, team_name text, is_hit boolean, pts int)
language sql security definer as
'
with
sc as (
  select
    max(case when phase=''r32''   then points else 0 end) as r32,
    max(case when phase=''r16''   then points else 0 end) as r16,
    max(case when phase=''qf''    then points else 0 end) as qf,
    max(case when phase=''sf''    then points else 0 end) as sf,
    max(case when phase=''final'' then points else 0 end) as fin
  from public.scoring_rules where type=''prediction''
),
ko_results as (
  select m.match_key, m.stage, m.team1_slot, m.team2_slot,
    case
      when ls.regular_time_home_score > ls.regular_time_away_score then ''home''
      when ls.regular_time_home_score < ls.regular_time_away_score then ''away''
      when ls.penalty_home_score      > ls.penalty_away_score      then ''home''
      when ls.penalty_home_score      < ls.penalty_away_score      then ''away''
      else null
    end as winner_side
  from public.matches m
  join public.live_scores ls on ls.match_key = m.match_key
  where m.stage in (''r32'',''r16'',''qf'',''sf'',''final'') and ls.status = ''FT''
),
r32_map(idx, mk) as (values
  (0,''29-0''),(1,''30-0''),(2,''28-0''),(3,''29-1''),
  (4,''32-0''),(5,''32-1''),(6,''31-1''),(7,''31-2''),
  (8,''29-2''),(9,''30-1''),(10,''30-2''),(11,''31-0''),
  (12,''33-0''),(13,''33-2''),(14,''32-2''),(15,''33-1'')
),
r16_map(idx, t1, t2) as (values
  (0,''W29-1'',''W29-2''),(1,''W30-1'',''W30-2''),
  (2,''W31-1'',''W31-2''),(3,''W32-1'',''W32-2''),
  (4,''W33-1'',''W33-2''),(5,''W34-1'',''W34-2''),
  (6,''W35-1'',''W35-2''),(7,''W36-1'',''W36-2'')
),
qf_map(idx, t1, t2) as (values
  (0,''QF1'',''QF2''),(1,''QF3'',''QF4''),
  (2,''QF5'',''QF6''),(3,''QF7'',''QF8'')
),
sf_map(idx, t1, t2) as (values
  (0,''SF L1'',''SF L2''),(1,''SF L3'',''SF L4'')
),
user_ko as (
  select ko_picks from public.predictions
  where user_id = p_user_id and board_id = p_board_id
  limit 1
),
r32_hits as (
  select ''R32''::text as round,
    case when (uk.ko_picks->>concat(''R32-'',rb.idx)) = ''home'' then t1.name else t2.name end as team_name,
    ((uk.ko_picks->>concat(''R32-'',rb.idx)) = kr.winner_side) as is_hit,
    (case when (uk.ko_picks->>concat(''R32-'',rb.idx)) = kr.winner_side then sc.r32 else 0 end)::int as pts
  from user_ko uk cross join sc
  cross join r32_map rb
  join ko_results kr on kr.match_key = rb.mk
  join public.matches m on m.match_key = rb.mk
  join public.teams t1 on t1.id = m.team1_id
  join public.teams t2 on t2.id = m.team2_id
  where (uk.ko_picks->>concat(''R32-'',rb.idx)) is not null
),
r16_hits as (
  select ''R16''::text,
    case when (uk.ko_picks->>concat(''R16-'',rb.idx)) = ''home'' then t1.name else t2.name end,
    ((uk.ko_picks->>concat(''R16-'',rb.idx)) = kr.winner_side),
    (case when (uk.ko_picks->>concat(''R16-'',rb.idx)) = kr.winner_side then sc.r16 else 0 end)::int
  from user_ko uk cross join sc
  cross join r16_map rb
  join ko_results kr on kr.stage=''r16'' and kr.team1_slot=rb.t1 and kr.team2_slot=rb.t2
  join public.matches m on m.stage=''r16'' and m.team1_slot=rb.t1 and m.team2_slot=rb.t2
  join public.teams t1 on t1.id = m.team1_id
  join public.teams t2 on t2.id = m.team2_id
  where (uk.ko_picks->>concat(''R16-'',rb.idx)) is not null
),
qf_hits as (
  select ''QF''::text,
    case when (uk.ko_picks->>concat(''QF-'',rb.idx)) = ''home'' then t1.name else t2.name end,
    ((uk.ko_picks->>concat(''QF-'',rb.idx)) = kr.winner_side),
    (case when (uk.ko_picks->>concat(''QF-'',rb.idx)) = kr.winner_side then sc.qf else 0 end)::int
  from user_ko uk cross join sc
  cross join qf_map rb
  join ko_results kr on kr.stage=''qf'' and kr.team1_slot=rb.t1 and kr.team2_slot=rb.t2
  join public.matches m on m.stage=''qf'' and m.team1_slot=rb.t1 and m.team2_slot=rb.t2
  join public.teams t1 on t1.id = m.team1_id
  join public.teams t2 on t2.id = m.team2_id
  where (uk.ko_picks->>concat(''QF-'',rb.idx)) is not null
),
sf_hits as (
  select ''SF''::text,
    case when (uk.ko_picks->>concat(''SF-'',rb.idx)) = ''home'' then t1.name else t2.name end,
    ((uk.ko_picks->>concat(''SF-'',rb.idx)) = kr.winner_side),
    (case when (uk.ko_picks->>concat(''SF-'',rb.idx)) = kr.winner_side then sc.sf else 0 end)::int
  from user_ko uk cross join sc
  cross join sf_map rb
  join ko_results kr on kr.stage=''sf'' and kr.team1_slot=rb.t1 and kr.team2_slot=rb.t2
  join public.matches m on m.stage=''sf'' and m.team1_slot=rb.t1 and m.team2_slot=rb.t2
  join public.teams t1 on t1.id = m.team1_id
  join public.teams t2 on t2.id = m.team2_id
  where (uk.ko_picks->>concat(''SF-'',rb.idx)) is not null
),
f_hits as (
  select ''Final''::text,
    case when (uk.ko_picks->>''F-0'') = ''home'' then t1.name else t2.name end,
    ((uk.ko_picks->>''F-0'') = kr.winner_side),
    (case when (uk.ko_picks->>''F-0'') = kr.winner_side then sc.fin else 0 end)::int
  from user_ko uk cross join sc
  join ko_results kr on kr.match_key = ''49-0''
  join public.matches m on m.match_key = ''49-0''
  join public.teams t1 on t1.id = m.team1_id
  join public.teams t2 on t2.id = m.team2_id
  where (uk.ko_picks->>''F-0'') is not null
)
select * from r32_hits
union all select * from r16_hits
union all select * from qf_hits
union all select * from sf_hits
union all select * from f_hits
'
