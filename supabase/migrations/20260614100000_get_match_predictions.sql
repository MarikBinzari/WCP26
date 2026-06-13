-- Returns all users' exact score predictions for a specific match in a board.
-- security definer bypasses RLS on exact_scores (which restricts to own rows).

create or replace function public.get_match_predictions(
  p_match_key text,
  p_board_id  text
)
returns table(
  user_id    uuid,
  name       text,
  avatar_url text,
  pred_home  int,
  pred_away  int
)
language plpgsql security definer as $$
begin
  return query
  select
    es.user_id,
    coalesce(p.display_name, '?') as name,
    p.avatar_url,
    es.team1_score as pred_home,
    es.team2_score as pred_away
  from public.exact_scores es
  join public.matches m on m.id = es.match_id
  left join public.profiles p on p.id = es.user_id
  where m.match_key = p_match_key
    and es.board_id = p_board_id;
end;
$$;
