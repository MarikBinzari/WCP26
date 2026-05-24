-- Step 1: add scoring columns + admin function + view
alter table public.special_picks
  add column if not exists champion_pts    int not null default 0,
  add column if not exists top_scorer_pts  int not null default 0;

-- Call after the final: select score_special_picks('Argentina', 'L. Messi', 'Argentina');
create or replace function public.score_special_picks(
  p_champion          text,
  p_top_scorer_player text,
  p_top_scorer_team   text
) returns void language sql security definer as $$
  update public.special_picks
  set
    champion_pts   = case when champion = p_champion then 3 else 0 end,
    top_scorer_pts = case when top_scorer_player = p_top_scorer_player
                           and top_scorer_team   = p_top_scorer_team
                          then 3 else 0 end;
$$;

-- Step 2: replace get_leaderboard to include special pick points in total
create or replace function public.get_leaderboard(
  p_board_id text,
  p_search   text default null
)
returns table(display_name text, total_pts integer)
language plpgsql security definer as $function$
begin
  if p_board_id = 'global' then
    if p_search is not null and p_search <> '' then
      return query
        select
          p.display_name,
          (coalesce(bs.total_pts, 0)
           + coalesce(sp.champion_pts + sp.top_scorer_pts, 0))::integer
        from profiles p
        left join board_scores bs
          on bs.user_id = p.id and bs.board_id = 'global'
        left join special_picks sp
          on sp.user_id = p.id and sp.board_id = 'global'
        where p.display_name ilike '%' || p_search || '%'
        order by 2 desc;
    else
      return query
        select
          p.display_name,
          (coalesce(bs.total_pts, 0)
           + coalesce(sp.champion_pts + sp.top_scorer_pts, 0))::integer
        from profiles p
        left join board_scores bs
          on bs.user_id = p.id and bs.board_id = 'global'
        left join special_picks sp
          on sp.user_id = p.id and sp.board_id = 'global'
        order by 2 desc
        limit 500;
    end if;
  else
    if p_search is not null and p_search <> '' then
      return query
        select
          p.display_name,
          (coalesce(bs.total_pts, 0)
           + coalesce(sp.champion_pts + sp.top_scorer_pts, 0))::integer
        from board_members bm
        join profiles p on p.id = bm.user_id
        left join board_scores bs
          on bs.user_id = bm.user_id and bs.board_id = p_board_id
        left join special_picks sp
          on sp.user_id = bm.user_id and sp.board_id = p_board_id
        where bm.board_id::text = p_board_id
          and p.display_name ilike '%' || p_search || '%'
        order by 2 desc;
    else
      return query
        select
          p.display_name,
          (coalesce(bs.total_pts, 0)
           + coalesce(sp.champion_pts + sp.top_scorer_pts, 0))::integer
        from board_members bm
        join profiles p on p.id = bm.user_id
        left join board_scores bs
          on bs.user_id = bm.user_id and bs.board_id = p_board_id
        left join special_picks sp
          on sp.user_id = bm.user_id and sp.board_id = p_board_id
        where bm.board_id::text = p_board_id
        order by 2 desc
        limit 500;
    end if;
  end if;
end;
$function$;
