-- Returnează clasamentele reale din grupă calculate din live_scores
-- Format: (group_id, team_name, rank, pts, gd, gf)
create or replace function public.get_group_standings()
returns table(group_id text, team_name text, rank int, pts int, gd int, gf int)
language sql security definer as $$
  with match_results as (
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
      sum(ts.grp_pts)::int as pts,
      sum(ts.gd)::int     as gd,
      sum(ts.gf)::int     as gf
    from team_stats ts
    group by ts.group_id, ts.team
  )
  select
    gt.group_id,
    gt.team as team_name,
    row_number() over (
      partition by gt.group_id
      order by gt.pts desc, gt.gd desc, gt.gf desc
    )::int as rank,
    gt.pts, gt.gd, gt.gf
  from group_totals gt
  order by gt.group_id, rank;
$$;
