-- get_user_best3_breakdown — picks de best 3rd cu 3 stări: hit / posibil / eliminat
drop function if exists public.get_user_best3_breakdown(uuid, text);
create or replace function public.get_user_best3_breakdown(
  p_user_id  uuid,
  p_board_id text
)
returns table(
  team        text,
  is_hit      boolean,
  is_possible boolean,
  pts         int
)
language sql security definer as $$
  with
  user_picks as (
    select jsonb_array_elements_text(p.best3_picks) as team
    from (
      select best3_picks from public.predictions
      where user_id = p_user_id and board_id = p_board_id
      limit 1
    ) p
  ),
  completed_groups as (
    select group_id from (
      select
        m.group_id,
        count(*) as total_matches,
        count(ls.match_key) filter (where ls.status = 'FT') as ft_matches
      from public.matches m
      left join public.live_scores ls on ls.match_key = m.match_key
      where m.stage = 'group'
      group by m.group_id
    ) t
    where ft_matches = total_matches and total_matches > 0
  ),
  all_groups_done as (
    select (
      select count(*) from completed_groups
    ) = (
      select count(distinct group_id) from public.matches where stage = 'group'
    ) as done
  ),
  -- team → group_id pentru TOATE echipele (inclusiv din grupe incomplete)
  team_groups as (
    select distinct t1.name as team, m.group_id
    from public.matches m
    join public.teams t1 on t1.id = m.team1_id
    where m.stage = 'group'
    union
    select distinct t2.name as team, m.group_id
    from public.matches m
    join public.teams t2 on t2.id = m.team2_id
    where m.stage = 'group'
  ),
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
    join completed_groups cg on cg.group_id = m.group_id
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
  sc as (
    select max(case when phase='best3' then points else 0 end) as b3
    from public.scoring_rules where type='prediction'
  )
  select
    up.team,
    -- is_hit: toate grupele gata + echipa e în top 8 de pe locul 3
    (agd.done and b.rk is not null and b.rk <= 8) as is_hit,
    -- is_possible:
    --   true  dacă grupa echipei NU e finalizată încă (rezultat necunoscut)
    --   true  dacă grupa e finalizată și echipa a terminat pe locul 3
    --   false dacă grupa e finalizată și echipa a terminat pe locul 1 sau 2 (imposibil)
    (
      not exists (
        select 1 from completed_groups cg
        join team_groups tg on tg.group_id = cg.group_id
        where tg.team = up.team
      )
      or tp.team is not null
    ) as is_possible,
    (case when agd.done and b.rk is not null and b.rk <= 8 then sc.b3 else 0 end)::int as pts
  from user_picks up
  cross join sc
  cross join all_groups_done agd
  left join best3_actual b on b.team = up.team
  left join third_place tp on tp.team = up.team;
$$;
