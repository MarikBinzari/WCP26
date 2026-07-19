create or replace function public.bulk_update_player_stats(p_players jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_changed integer := 0;
  r record;
begin
  for r in
    select *
    from jsonb_to_recordset(p_players) as x(
      api_football_id integer,
      team_name text,
      player_name text,
      nationality text,
      position text,
      photo_url text,
      height text,
      weight text,
      goals integer,
      assists integer,
      yellow_cards integer,
      red_cards integer,
      minutes_played integer,
      rating numeric,
      appearances integer,
      updated_at timestamptz
    )
  loop
    update public.world_cup_football_players
    set team_name = r.team_name,
        player_name = r.player_name,
        nationality = r.nationality,
        position = r.position,
        photo_url = r.photo_url,
        height = r.height,
        weight = r.weight,
        goals = coalesce(r.goals, 0),
        assists = coalesce(r.assists, 0),
        yellow_cards = coalesce(r.yellow_cards, 0),
        red_cards = coalesce(r.red_cards, 0),
        minutes_played = coalesce(r.minutes_played, 0),
        rating = r.rating,
        appearances = coalesce(r.appearances, 0),
        updated_at = coalesce(r.updated_at, now())
    where api_football_id = r.api_football_id;

    if found then
      v_changed := v_changed + 1;
    else
      insert into public.world_cup_football_players (
        api_football_id,
        team_name,
        player_name,
        nationality,
        position,
        photo_url,
        height,
        weight,
        goals,
        assists,
        yellow_cards,
        red_cards,
        minutes_played,
        rating,
        appearances,
        updated_at
      ) values (
        r.api_football_id,
        r.team_name,
        r.player_name,
        r.nationality,
        r.position,
        r.photo_url,
        r.height,
        r.weight,
        coalesce(r.goals, 0),
        coalesce(r.assists, 0),
        coalesce(r.yellow_cards, 0),
        coalesce(r.red_cards, 0),
        coalesce(r.minutes_played, 0),
        r.rating,
        coalesce(r.appearances, 0),
        coalesce(r.updated_at, now())
      );
      v_changed := v_changed + 1;
    end if;
  end loop;

  return v_changed;
end;
$$;
