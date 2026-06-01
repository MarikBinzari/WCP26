create or replace function public.ensure_board_scores(
  p_user_id uuid,
  p_board_ids text[]
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.board_scores (user_id, board_id, pred_pts, exact_pts, updated_at)
  select p_user_id, board_id, 0, 0, now()
  from unnest(p_board_ids) as board_id
  where board_id is not null and board_id <> ''
  on conflict (user_id, board_id) do nothing;
end;
$$;

insert into public.board_scores (user_id, board_id, pred_pts, exact_pts, updated_at)
select bm.user_id, bm.board_id::text, 0, 0, now()
from public.board_members bm
on conflict (user_id, board_id) do nothing;

insert into public.board_scores (user_id, board_id, pred_pts, exact_pts, updated_at)
select p.id, 'global', 0, 0, now()
from public.profiles p
on conflict (user_id, board_id) do nothing;
