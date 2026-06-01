alter table if exists public.players
  rename to world_cup_football_players;

alter index if exists public.players_api_id_idx
  rename to world_cup_football_players_api_id_idx;

alter index if exists public.players_api_football_id_idx
  rename to world_cup_football_players_api_football_id_idx;

alter index if exists public.players_team_player_idx
  rename to world_cup_football_players_team_player_idx;

alter policy if exists "public_read_players"
  on public.world_cup_football_players
  rename to "public_read_world_cup_football_players";

alter policy if exists "service_write_players"
  on public.world_cup_football_players
  rename to "service_write_world_cup_football_players";
