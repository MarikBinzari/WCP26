-- ─────────────────────────────────────────────────────────────────────────────
-- score_bracket_predictions()
-- Calculează pred_pts pentru predicțiile de bracket (grupă + KO).
-- Citește punctajul din scoring_rules (type='prediction').
-- Rezultatele reale vin din live_scores + matches + teams.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.score_bracket_predictions()
returns table(user_id uuid, board_id text, pred_pts int, grp_pts int, b3_pts int, ko_pts int)
language sql security definer as $$
  with
  -- Valorile de punctaj citite o singură dată
  sc as (
    select
      max(case when phase='group1st' then points else 0 end) as group1st,
      max(case when phase='group2nd' then points else 0 end) as group2nd,
      max(case when phase='group3rd' then points else 0 end) as group3rd,
      max(case when phase='best3'    then points else 0 end) as best3,
      max(case when phase='r32'      then points else 0 end) as r32,
      max(case when phase='r16'      then points else 0 end) as r16,
      max(case when phase='qf'       then points else 0 end) as qf,
      max(case when phase='sf'       then points else 0 end) as sf,
      max(case when phase='final'    then points else 0 end) as final
    from public.scoring_rules
    where type = 'prediction'
  ),
  -- Rezultate meciuri de grupă
  match_results as (
    select
      m.group_id,
      t1.name as team1, t2.name as team2,
      ls.regular_time_home_score as s1,
      ls.regular_time_away_score as s2
    from public.matches m
    join public.teams t1 on t1.id = m.team1_id
    join public.teams t2 on t2.id = m.team2_id
    join public.live_scores ls on ls.match_key = m.match_key
    where m.stage = 'group' and ls.status = 'FT'
  ),
  team_stats as (
    select group_id, team1 as team,
      case when s1>s2 then 3 when s1=s2 then 1 else 0 end as grp_pts,
      s1-s2 as gd, s1 as gf
    from match_results
    union all
    select group_id, team2 as team,
      case when s2>s1 then 3 when s1=s2 then 1 else 0 end as grp_pts,
      s2-s1 as gd, s2 as gf
    from match_results
  ),
  group_totals as (
    select ts.group_id, ts.team,
      sum(ts.grp_pts) as grp_pts,
      sum(ts.gd) as gd,
      sum(ts.gf) as gf
    from team_stats ts
    group by ts.group_id, ts.team
  ),
  group_standings as (
    select gt.group_id, gt.team,
      row_number() over (
        partition by gt.group_id
        order by gt.grp_pts desc, gt.gd desc, gt.gf desc
      ) as rank
    from group_totals gt
  ),
  third_place as (
    select gs.group_id, gs.team, gt.grp_pts, gt.gd, gt.gf
    from group_standings gs
    join group_totals gt on gt.group_id = gs.group_id and gt.team = gs.team
    where gs.rank = 3
  ),
  best3_actual as (
    select tp.team,
      row_number() over (
        order by tp.grp_pts desc, tp.gd desc, tp.gf desc
      ) as rk
    from third_place tp
  ),
  -- Rezultate KO
  ko_results as (
    select m.stage, m.team1_slot, m.team2_slot,
      case
        when ls.regular_time_home_score > ls.regular_time_away_score then 'home'
        when ls.regular_time_home_score < ls.regular_time_away_score then 'away'
        when ls.penalty_home_score > ls.penalty_away_score then 'home'
        when ls.penalty_home_score < ls.penalty_away_score then 'away'
        else null
      end as winner_side
    from public.matches m
    join public.live_scores ls on ls.match_key = m.match_key
    where m.stage in ('r32','r16','qf','sf','final') and ls.status = 'FT'
  ),
  -- Scoring grupă
  group_pts as (
    select p.user_id, p.board_id,
      sum(
        case when gs.rank=1 and (p.group_rankings->gs.group_id->>0)=gs.team then sc.group1st else 0 end +
        case when gs.rank=2 and (p.group_rankings->gs.group_id->>1)=gs.team then sc.group2nd else 0 end +
        case when gs.rank=3 and (p.group_rankings->gs.group_id->>2)=gs.team then sc.group3rd else 0 end
      )::int as pts
    from public.predictions p
    cross join sc
    join group_standings gs on p.group_rankings ? gs.group_id
    group by p.user_id, p.board_id
  ),
  -- Scoring best 3rd
  best3_pts as (
    select p.user_id, p.board_id,
      (count(*) * sc.best3)::int as pts
    from public.predictions p
    cross join sc
    cross join jsonb_array_elements_text(p.best3_picks) as pick
    join best3_actual b on b.team = pick and b.rk <= 8
    group by p.user_id, p.board_id, sc.best3
  ),
  -- Bracket maps (idx → slots)
  r32_map(idx, t1, t2) as (values
    (0,'1A','2C'),(1,'1C','2A'),(2,'1B','2D'),(3,'1D','2B'),
    (4,'1E','2G'),(5,'1G','2E'),(6,'1F','2H'),(7,'1H','2F'),
    (8,'1I','2K'),(9,'1K','2I'),(10,'1J','2L'),(11,'1L','2J'),
    (12,'1best3','2best3'),(13,'3best3','4best3'),
    (14,'5best3','6best3'),(15,'7best3','8best3')
  ),
  r16_map(idx, t1, t2) as (values
    (0,'W29-1','W29-2'),(1,'W30-1','W30-2'),
    (2,'W31-1','W31-2'),(3,'W32-1','W32-2'),
    (4,'W33-1','W33-2'),(5,'W34-1','W34-2'),
    (6,'W35-1','W35-2'),(7,'W36-1','W36-2')
  ),
  qf_map(idx, t1, t2) as (values
    (0,'QF1','QF2'),(1,'QF3','QF4'),
    (2,'QF5','QF6'),(3,'QF7','QF8')
  ),
  sf_map(idx, t1, t2) as (values
    (0,'SF L1','SF L2'),
    (1,'SF L3','SF L4')
  ),
  -- Scoring KO rounds
  r32_pts as (
    select p.user_id, p.board_id,
      sum(case when kr.winner_side = (p.ko_picks->>concat('R32-',rb.idx)) then sc.r32 else 0 end)::int as pts
    from public.predictions p cross join sc cross join r32_map rb
    join ko_results kr on kr.stage='r32' and kr.team1_slot=rb.t1 and kr.team2_slot=rb.t2
    where p.ko_picks ? concat('R32-',rb.idx)
    group by p.user_id, p.board_id
  ),
  r16_pts as (
    select p.user_id, p.board_id,
      sum(case when kr.winner_side = (p.ko_picks->>concat('R16-',rb.idx)) then sc.r16 else 0 end)::int as pts
    from public.predictions p cross join sc cross join r16_map rb
    join ko_results kr on kr.stage='r16' and kr.team1_slot=rb.t1 and kr.team2_slot=rb.t2
    where p.ko_picks ? concat('R16-',rb.idx)
    group by p.user_id, p.board_id
  ),
  qf_pts as (
    select p.user_id, p.board_id,
      sum(case when kr.winner_side = (p.ko_picks->>concat('QF-',rb.idx)) then sc.qf else 0 end)::int as pts
    from public.predictions p cross join sc cross join qf_map rb
    join ko_results kr on kr.stage='qf' and kr.team1_slot=rb.t1 and kr.team2_slot=rb.t2
    where p.ko_picks ? concat('QF-',rb.idx)
    group by p.user_id, p.board_id
  ),
  sf_pts as (
    select p.user_id, p.board_id,
      sum(case when kr.winner_side = (p.ko_picks->>concat('SF-',rb.idx)) then sc.sf else 0 end)::int as pts
    from public.predictions p cross join sc cross join sf_map rb
    join ko_results kr on kr.stage='sf' and kr.team1_slot=rb.t1 and kr.team2_slot=rb.t2
    where p.ko_picks ? concat('SF-',rb.idx)
    group by p.user_id, p.board_id
  ),
  f_pts as (
    select p.user_id, p.board_id,
      sum(case when kr.winner_side = (p.ko_picks->>'F-0') then sc.final else 0 end)::int as pts
    from public.predictions p cross join sc
    join ko_results kr on kr.stage='final' and kr.team1_slot='SF W1' and kr.team2_slot='SF W2'
    where p.ko_picks ? 'F-0'
    group by p.user_id, p.board_id
  )
  select
    p.user_id,
    p.board_id,
    (coalesce(gp.pts,0) + coalesce(b3.pts,0) +
     coalesce(r32.pts,0) + coalesce(r16.pts,0) +
     coalesce(qf.pts,0)  + coalesce(sf.pts,0)  + coalesce(f.pts,0))::int as pred_pts,
    coalesce(gp.pts,0)::int  as grp_pts,
    coalesce(b3.pts,0)::int  as b3_pts,
    (coalesce(r32.pts,0) + coalesce(r16.pts,0) +
     coalesce(qf.pts,0)  + coalesce(sf.pts,0)  + coalesce(f.pts,0))::int as ko_pts
  from public.predictions p
  left join group_pts gp  on gp.user_id=p.user_id  and gp.board_id=p.board_id
  left join best3_pts b3  on b3.user_id=p.user_id  and b3.board_id=p.board_id
  left join r32_pts   r32 on r32.user_id=p.user_id and r32.board_id=p.board_id
  left join r16_pts   r16 on r16.user_id=p.user_id and r16.board_id=p.board_id
  left join qf_pts    qf  on qf.user_id=p.user_id  and qf.board_id=p.board_id
  left join sf_pts    sf  on sf.user_id=p.user_id  and sf.board_id=p.board_id
  left join f_pts     f   on f.user_id=p.user_id   and f.board_id=p.board_id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- apply_bracket_scores()
-- Aplică rezultatele în board_scores.pred_pts.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.apply_bracket_scores()
returns void language plpgsql security definer as $$
begin
  with pts as (
    select user_id, board_id, pred_pts, grp_pts, b3_pts, ko_pts
    from public.score_bracket_predictions()
  )
  insert into public.board_scores (user_id, board_id, group_pts, best3_pts, knockout_pts, pred_pts, exact_pts, updated_at)
  select p.user_id, p.board_id, p.grp_pts, p.b3_pts, p.ko_pts, p.pred_pts, 0, now()
  from pts p
  on conflict (user_id, board_id) do update
    set group_pts    = excluded.group_pts,
        best3_pts    = excluded.best3_pts,
        knockout_pts = excluded.knockout_pts,
        pred_pts     = excluded.pred_pts,
        updated_at   = now();
end;
$$;

-- Preview:  select * from score_bracket_predictions();
-- Aplică:   select apply_bracket_scores();
