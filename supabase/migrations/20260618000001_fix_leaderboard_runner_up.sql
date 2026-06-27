-- Fix get_leaderboard: adaugă runner_up_pts la total (lipsea din formulă)
-- Folosim CREATE OR REPLACE (nu schimbăm tipul returnat, doar formula)

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
          (coalesce(bs.total_pts, 0)
           + coalesce(sp.champion_pts,   0)
           + coalesce(sp.runner_up_pts,  0)
           + coalesce(sp.top_scorer_pts, 0))::integer,
          p.avatar_url
        from profiles p
        left join board_scores bs on bs.user_id = p.id and bs.board_id = 'global'
        left join special_picks sp on sp.user_id = p.id and sp.board_id = 'global'
        where p.display_name ilike '%' || p_search || '%'
        order by 3 desc;
    else
      return query
        select p.id, p.display_name,
          (coalesce(bs.total_pts, 0)
           + coalesce(sp.champion_pts,   0)
           + coalesce(sp.runner_up_pts,  0)
           + coalesce(sp.top_scorer_pts, 0))::integer,
          p.avatar_url
        from profiles p
        left join board_scores bs on bs.user_id = p.id and bs.board_id = 'global'
        left join special_picks sp on sp.user_id = p.id and sp.board_id = 'global'
        order by 3 desc limit 500;
    end if;
  else
    if p_search is not null and p_search <> '' then
      return query
        select p.id, p.display_name,
          (coalesce(bs.total_pts, 0)
           + coalesce(sp.champion_pts,   0)
           + coalesce(sp.runner_up_pts,  0)
           + coalesce(sp.top_scorer_pts, 0))::integer,
          p.avatar_url
        from board_members bm
        join profiles p on p.id = bm.user_id
        left join board_scores bs on bs.user_id = bm.user_id and bs.board_id = p_board_id
        left join special_picks sp on sp.user_id = bm.user_id and sp.board_id = p_board_id
        where bm.board_id::text = p_board_id
          and p.display_name ilike '%' || p_search || '%'
        order by 3 desc;
    else
      return query
        select p.id, p.display_name,
          (coalesce(bs.total_pts, 0)
           + coalesce(sp.champion_pts,   0)
           + coalesce(sp.runner_up_pts,  0)
           + coalesce(sp.top_scorer_pts, 0))::integer,
          p.avatar_url
        from board_members bm
        join profiles p on p.id = bm.user_id
        left join board_scores bs on bs.user_id = bm.user_id and bs.board_id = p_board_id
        left join special_picks sp on sp.user_id = bm.user_id and sp.board_id = p_board_id
        where bm.board_id::text = p_board_id
        order by 3 desc limit 500;
    end if;
  end if;
end;
$function$;
