create or replace function public.apply_exact_scores()
returns void language plpgsql security definer as $$
begin
  with pts_per_user as (
    select user_id, board_id, sum(pts) as earned
    from public.score_exact_picks()
    group by user_id, board_id
  )
  insert into public.board_scores (user_id, board_id, exact_pts, pred_pts, updated_at)
  select
    p.user_id,
    p.board_id,
    p.earned,
    0,
    now()
  from pts_per_user p
  on conflict (user_id, board_id) do update
    set exact_pts = excluded.exact_pts,
        updated_at = now();
end;
$$;
