-- Fix: ranking movement shows false values for users with equal pts
-- Root cause: row_number() over (order by pts desc) is non-deterministic for ties
-- Fix: add uid asc tiebreaker in both get_leaderboard and take_ranking_snapshot
-- Also: nullify movement when pts = 0 (semantic guard)

-- ── 1. fix get_leaderboard ────────────────────────────────────────────────────
drop function if exists public.get_leaderboard(text, text);

create function public.get_leaderboard(
  p_board_id text,
  p_search   text default null
)
returns table(user_id uuid, display_name text, total_pts integer, avatar_url text, movement integer)
language plpgsql security definer as $function$
declare
  v_snap_time timestamptz;
begin
  select max(captured_at) into v_snap_time
  from public.ranking_snapshots where board_id = p_board_id;

  if p_board_id = 'global' then
    return query
      with ranked as (
        select p.id as uid, p.display_name, p.avatar_url,
          (coalesce(bs.total_pts,0)+coalesce(sp.champion_pts,0)+coalesce(sp.runner_up_pts,0)+coalesce(sp.top_scorer_pts,0))::int as pts
        from public.profiles p
        left join public.board_scores  bs on bs.user_id=p.id and bs.board_id='global'
        left join public.special_picks sp on sp.user_id=p.id and sp.board_id='global'
        where (p_search is null or p_search='' or p.display_name ilike '%'||p_search||'%')
      ),
      with_rank as (
        select *, row_number() over (order by pts desc, uid asc)::int as cur_rank from ranked
      )
      select wr.uid, wr.display_name, wr.pts, wr.avatar_url,
        case when wr.pts = 0 then null
             else (sn.rank - wr.cur_rank)::integer
        end as movement
      from with_rank wr
      left join public.ranking_snapshots sn
        on sn.user_id=wr.uid and sn.board_id=p_board_id and sn.captured_at=v_snap_time
      order by wr.pts desc, wr.uid asc limit 500;
  else
    return query
      with ranked as (
        select p.id as uid, p.display_name, p.avatar_url,
          (coalesce(bs.total_pts,0)+coalesce(sp.champion_pts,0)+coalesce(sp.runner_up_pts,0)+coalesce(sp.top_scorer_pts,0))::int as pts
        from public.board_members bm
        join public.profiles p on p.id=bm.user_id
        left join public.board_scores  bs on bs.user_id=bm.user_id and bs.board_id::text=bm.board_id::text
        left join public.special_picks sp on sp.user_id=bm.user_id and sp.board_id::text=bm.board_id::text
        where bm.board_id::text=p_board_id
          and (p_search is null or p_search='' or p.display_name ilike '%'||p_search||'%')
      ),
      with_rank as (
        select *, row_number() over (order by pts desc, uid asc)::int as cur_rank from ranked
      )
      select wr.uid, wr.display_name, wr.pts, wr.avatar_url,
        case when wr.pts = 0 then null
             else (sn.rank - wr.cur_rank)::integer
        end as movement
      from with_rank wr
      left join public.ranking_snapshots sn
        on sn.user_id=wr.uid and sn.board_id=p_board_id and sn.captured_at=v_snap_time
      order by wr.pts desc, wr.uid asc limit 500;
  end if;
end;
$function$;

-- ── 2. fix take_ranking_snapshot ─────────────────────────────────────────────
create or replace function public.take_ranking_snapshot()
returns void language plpgsql security definer as $$
begin
  insert into public.ranking_snapshots (board_id, user_id, rank, pts, captured_at)
  with current_pts as (
    select 'global'::text as board_id, p.id as user_id,
      (coalesce(bs.total_pts,0)+coalesce(sp.champion_pts,0)+coalesce(sp.runner_up_pts,0)+coalesce(sp.top_scorer_pts,0))::int as pts
    from public.profiles p
    left join public.board_scores  bs on bs.user_id=p.id and bs.board_id='global'
    left join public.special_picks sp on sp.user_id=p.id and sp.board_id='global'
    union all
    select bm.board_id::text, bm.user_id,
      (coalesce(bs.total_pts,0)+coalesce(sp.champion_pts,0)+coalesce(sp.runner_up_pts,0)+coalesce(sp.top_scorer_pts,0))::int
    from public.board_members bm
    left join public.board_scores  bs on bs.user_id=bm.user_id and bs.board_id::text=bm.board_id::text
    left join public.special_picks sp on sp.user_id=bm.user_id and sp.board_id::text=bm.board_id::text
  )
  select board_id, user_id,
    row_number() over (partition by board_id order by pts desc, user_id asc)::int as rank,
    pts, now()
  from current_pts;
end;
$$;

-- ── 3. retake snapshot cu ordinea corectă ────────────────────────────────────
select public.take_ranking_snapshot();
