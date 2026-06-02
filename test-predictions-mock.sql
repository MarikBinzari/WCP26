-- ══════════════════════════════════════════════════════════════════════════════
-- TEST SCRIPT: Mock live_scores grup cu grup — predicțiile lui John Snow
-- Rulează în Supabase SQL Editor câte un bloc pe rând
-- Fiecare bloc = o grupă terminată + recalcul scoring
-- ROLLBACK complet la final (bloc comentat)
-- ══════════════════════════════════════════════════════════════════════════════

-- Verifică că John Snow există
SELECT id, display_name FROM public.profiles WHERE display_name ILIKE 'john snow' or display_name ILIKE 'Alex' ;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 1 — Grupa A: Mexico · South Africa · Korea Republic · Czech Republic
-- Real standings: 1.Mexico  2.Czech Republic  3.Korea Republic  4.South Africa
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('11-0', 'FT', 2, 0, null, null, now()),  -- Mexico 2-0 South Africa
  ('11-1', 'FT', 1, 2, null, null, now()),  -- Korea Republic 1-2 Czech Republic
  ('18-0', 'FT', 2, 0, null, null, now()),  -- Czech Republic 2-0 South Africa
  ('18-1', 'FT', 2, 1, null, null, now()),  -- Mexico 2-1 Korea Republic
  ('24-0', 'FT', 1, 2, null, null, now()),  -- Czech Republic 1-2 Mexico
  ('24-1', 'FT', 0, 1, null, null, now())   -- South Africa 0-1 Korea Republic
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'A' ORDER BY rank;
SELECT  apply_exact_scores();
-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 2 — Grupa B: Canada · Bosnia and Herzegovina · Qatar · Switzerland
-- Real standings: 1.Switzerland  2.Canada  3.Bosnia and Herzegovina  4.Qatar
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('12-0', 'FT', 2, 0, null, null, now()),  -- Canada 2-0 Bosnia
  ('12-1', 'FT', 0, 2, null, null, now()),  -- Qatar 0-2 Switzerland
  ('18-2', 'FT', 2, 0, null, null, now()),  -- Switzerland 2-0 Bosnia
  ('18-3', 'FT', 2, 0, null, null, now()),  -- Canada 2-0 Qatar
  ('24-2', 'FT', 2, 1, null, null, now()),  -- Switzerland 2-1 Canada
  ('24-3', 'FT', 2, 0, null, null, now())   -- Bosnia 2-0 Qatar
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT  apply_exact_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'B' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 3 — Grupa C: Brazil · Morocco · Scotland · Haiti
-- Real standings: 1.Brazil  2.Morocco  3.Scotland  4.Haiti
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('13-0', 'FT', 2, 0, null, null, now()),  -- Brazil 2-0 Morocco
  ('13-1', 'FT', 0, 2, null, null, now()),  -- Haiti 0-2 Scotland
  ('19-0', 'FT', 3, 0, null, null, now()),  -- Brazil 3-0 Haiti
  ('19-1', 'FT', 0, 1, null, null, now()),  -- Scotland 0-1 Morocco
  ('24-4', 'FT', 0, 1, null, null, now()),  -- Scotland 0-1 Brazil
  ('24-5', 'FT', 2, 0, null, null, now())   -- Morocco 2-0 Haiti
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'C' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 4 — Grupa D: USA · Paraguay · Australia · Turkey
-- Real standings: 1.USA  2.Turkey  3.Australia  4.Paraguay
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('12-2', 'FT', 2, 0, null, null, now()),  -- USA 2-0 Paraguay
  ('12-3', 'FT', 0, 2, null, null, now()),  -- Australia 0-2 Turkey
  ('19-2', 'FT', 2, 0, null, null, now()),  -- Turkey 2-0 Paraguay
  ('19-3', 'FT', 2, 0, null, null, now()),  -- USA 2-0 Australia
  ('25-0', 'FT', 0, 1, null, null, now()),  -- Turkey 0-1 USA
  ('25-1', 'FT', 0, 1, null, null, now())   -- Paraguay 0-1 Australia
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'D' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 5 — Grupa E: Germany · Curaçao · Côte d'Ivoire · Ecuador
-- Real standings: 1.Germany  2.Ecuador  3.Côte d'Ivoire  4.Curaçao
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('14-0', 'FT', 3, 0, null, null, now()),  -- Germany 3-0 Curaçao
  ('14-1', 'FT', 0, 2, null, null, now()),  -- Côte d'Ivoire 0-2 Ecuador
  ('20-0', 'FT', 2, 0, null, null, now()),  -- Germany 2-0 Côte d'Ivoire
  ('20-1', 'FT', 2, 0, null, null, now()),  -- Ecuador 2-0 Curaçao
  ('25-2', 'FT', 0, 1, null, null, now()),  -- Ecuador 0-1 Germany
  ('25-3', 'FT', 0, 1, null, null, now())   -- Curaçao 0-1 Côte d'Ivoire
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'E' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 6 — Grupa F: Netherlands · Japan · Sweden · Tunisia
-- Real standings: 1.Netherlands  2.Japan  3.Sweden  4.Tunisia
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('14-2', 'FT', 2, 1, null, null, now()),  -- Netherlands 2-1 Japan
  ('14-3', 'FT', 2, 0, null, null, now()),  -- Sweden 2-0 Tunisia
  ('20-2', 'FT', 2, 0, null, null, now()),  -- Netherlands 2-0 Sweden
  ('20-3', 'FT', 0, 2, null, null, now()),  -- Tunisia 0-2 Japan
  ('25-4', 'FT', 0, 2, null, null, now()),  -- Tunisia 0-2 Netherlands
  ('25-5', 'FT', 2, 1, null, null, now())   -- Japan 2-1 Sweden
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'F' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 7 — Grupa G: Belgium · Egypt · Iran · New Zealand
-- Real standings: 1.Belgium  2.Iran  3.New Zealand  4.Egypt
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('15-0', 'FT', 2, 0, null, null, now()),  -- Belgium 2-0 Egypt
  ('15-1', 'FT', 2, 0, null, null, now()),  -- Iran 2-0 New Zealand
  ('21-0', 'FT', 2, 1, null, null, now()),  -- Belgium 2-1 Iran
  ('21-1', 'FT', 1, 0, null, null, now()),  -- New Zealand 1-0 Egypt
  ('25-6', 'FT', 0, 2, null, null, now()),  -- New Zealand 0-2 Belgium
  ('25-7', 'FT', 0, 2, null, null, now())   -- Egypt 0-2 Iran
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'G' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 8 — Grupa H: Spain · Cape Verde · Saudi Arabia · Uruguay
-- Real standings: 1.Spain  2.Uruguay  3.Saudi Arabia  4.Cape Verde
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('15-2', 'FT', 3, 0, null, null, now()),  -- Spain 3-0 Cape Verde
  ('15-3', 'FT', 0, 2, null, null, now()),  -- Saudi Arabia 0-2 Uruguay
  ('21-2', 'FT', 2, 0, null, null, now()),  -- Spain 2-0 Saudi Arabia
  ('21-3', 'FT', 2, 0, null, null, now()),  -- Uruguay 2-0 Cape Verde
  ('25-8', 'FT', 0, 1, null, null, now()),  -- Uruguay 0-1 Spain
  ('25-9', 'FT', 0, 1, null, null, now())   -- Cape Verde 0-1 Saudi Arabia
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'H' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 9 — Grupa I: France · Senegal · Iraq · Norway
-- Real standings: 1.France  2.Norway  3.Senegal  4.Iraq
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('16-0', 'FT', 2, 0, null, null, now()),  -- France 2-0 Senegal
  ('16-1', 'FT', 0, 2, null, null, now()),  -- Iraq 0-2 Norway
  ('22-0', 'FT', 3, 0, null, null, now()),  -- France 3-0 Iraq
  ('22-1', 'FT', 2, 0, null, null, now()),  -- Norway 2-0 Senegal
  ('26-0', 'FT', 0, 1, null, null, now()),  -- Norway 0-1 France
  ('26-1', 'FT', 2, 0, null, null, now())   -- Senegal 2-0 Iraq
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'I' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 10 — Grupa J: Argentina · Algeria · Austria · Jordan
-- Real standings: 1.Argentina  2.Austria  3.Algeria  4.Jordan
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('16-2', 'FT', 2, 0, null, null, now()),  -- Argentina 2-0 Algeria
  ('16-3', 'FT', 2, 0, null, null, now()),  -- Austria 2-0 Jordan
  ('22-2', 'FT', 2, 1, null, null, now()),  -- Argentina 2-1 Austria
  ('22-3', 'FT', 0, 1, null, null, now()),  -- Jordan 0-1 Algeria
  ('27-0', 'FT', 0, 2, null, null, now()),  -- Jordan 0-2 Argentina
  ('27-1', 'FT', 0, 1, null, null, now())   -- Algeria 0-1 Austria
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'J' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 11 — Grupa K: Portugal · DR Congo · Uzbekistan · Colombia
-- Real standings: 1.Portugal  2.Colombia  3.Uzbekistan  4.DR Congo
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('17-0', 'FT', 3, 0, null, null, now()),  -- Portugal 3-0 DR Congo
  ('17-1', 'FT', 0, 2, null, null, now()),  -- Uzbekistan 0-2 Colombia
  ('23-0', 'FT', 2, 0, null, null, now()),  -- Portugal 2-0 Uzbekistan
  ('23-1', 'FT', 2, 0, null, null, now()),  -- Colombia 2-0 DR Congo
  ('27-2', 'FT', 0, 1, null, null, now()),  -- Colombia 0-1 Portugal
  ('27-3', 'FT', 0, 1, null, null, now())   -- DR Congo 0-1 Uzbekistan
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'K' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 12 — Grupa L: England · Croatia · Ghana · Panama
-- Real standings: 1.England  2.Croatia  3.Ghana  4.Panama
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('17-2', 'FT', 2, 1, null, null, now()),  -- England 2-1 Croatia
  ('17-3', 'FT', 1, 0, null, null, now()),  -- Ghana 1-0 Panama
  ('23-2', 'FT', 2, 0, null, null, now()),  -- England 2-0 Ghana
  ('23-3', 'FT', 0, 2, null, null, now()),  -- Panama 0-2 Croatia
  ('27-4', 'FT', 0, 1, null, null, now()),  -- Panama 0-1 England
  ('27-5', 'FT', 2, 0, null, null, now())   -- Croatia 2-0 Ghana
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'L' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICARE FINALĂ — puncte John Snow după toate grupele
-- ══════════════════════════════════════════════════════════════════════════════
SELECT 'Puncte John Snow dupa toate grupele:' as info;
SELECT s.pred_pts, s.exact_pts, s.total_pts
FROM public.board_scores s
JOIN public.profiles p ON p.id = s.user_id
WHERE p.display_name ILIKE 'john snow' AND s.board_id = 'global';

SELECT 'Clasament global:' as info;
SELECT p.display_name, bs.pred_pts, bs.total_pts
FROM public.board_scores bs
JOIN public.profiles p ON p.id = bs.user_id
WHERE bs.board_id = 'global'
ORDER BY bs.total_pts DESC
LIMIT 10;

-- ══════════════════════════════════════════════════════════════════════════════
-- ROLLBACK — descomenteaza tot blocul si rulează când termini testul
-- ══════════════════════════════════════════════════════════════════════════════

DELETE FROM public.live_scores WHERE match_key IN (
  '11-0','11-1','18-0','18-1','24-0','24-1',
  '12-0','12-1','18-2','18-3','24-2','24-3',
  '13-0','13-1','19-0','19-1','24-4','24-5',
  '12-2','12-3','19-2','19-3','25-0','25-1',
  '14-0','14-1','20-0','20-1','25-2','25-3',
  '14-2','14-3','20-2','20-3','25-4','25-5',
  '15-0','15-1','21-0','21-1','25-6','25-7',
  '15-2','15-3','21-2','21-3','25-8','25-9',
  '16-0','16-1','22-0','22-1','26-0','26-1',
  '16-2','16-3','22-2','22-3','27-0','27-1',
  '17-0','17-1','23-0','23-1','27-2','27-3',
  '17-2','17-3','23-2','23-3','27-4','27-5'
);
UPDATE public.board_scores SET exact_score_pts = 0, group_pts = 0, best3_pts = 0, knockout_pts = 0, pred_pts = 0, exact_pts = 0;
SELECT apply_bracket_scores();
SELECT apply_exact_scores();
SELECT 'Rollback complet. board_scores resetate.' as status;
-- ══════════════════════════════════════════════════════════════════════════════
-- TEST SCRIPT: Mock live_scores grup cu grup — predicțiile lui John Snow
-- Rulează în Supabase SQL Editor câte un bloc pe rând
-- Fiecare bloc = o grupă terminată + recalcul scoring
-- ROLLBACK complet la final (bloc comentat)
-- ══════════════════════════════════════════════════════════════════════════════

-- Verifică că John Snow există
SELECT id, display_name FROM public.profiles WHERE display_name ILIKE 'john snow' or display_name ILIKE 'Alex' ;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 1 — Grupa A: Mexico · South Africa · Korea Republic · Czech Republic
-- Real standings: 1.Mexico  2.Czech Republic  3.Korea Republic  4.South Africa
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('11-0', 'FT', 2, 0, null, null, now()),  -- Mexico 2-0 South Africa
  ('11-1', 'FT', 1, 2, null, null, now()),  -- Korea Republic 1-2 Czech Republic
  ('18-0', 'FT', 2, 0, null, null, now()),  -- Czech Republic 2-0 South Africa
  ('18-1', 'FT', 2, 1, null, null, now()),  -- Mexico 2-1 Korea Republic
  ('24-0', 'FT', 1, 2, null, null, now()),  -- Czech Republic 1-2 Mexico
  ('24-1', 'FT', 0, 1, null, null, now())   -- South Africa 0-1 Korea Republic
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'A' ORDER BY rank;
SELECT  apply_exact_scores();
-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 2 — Grupa B: Canada · Bosnia and Herzegovina · Qatar · Switzerland
-- Real standings: 1.Switzerland  2.Canada  3.Bosnia and Herzegovina  4.Qatar
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('12-0', 'FT', 2, 0, null, null, now()),  -- Canada 2-0 Bosnia
  ('12-1', 'FT', 0, 2, null, null, now()),  -- Qatar 0-2 Switzerland
  ('18-2', 'FT', 2, 0, null, null, now()),  -- Switzerland 2-0 Bosnia
  ('18-3', 'FT', 2, 0, null, null, now()),  -- Canada 2-0 Qatar
  ('24-2', 'FT', 2, 1, null, null, now()),  -- Switzerland 2-1 Canada
  ('24-3', 'FT', 2, 0, null, null, now())   -- Bosnia 2-0 Qatar
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT  apply_exact_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'B' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 3 — Grupa C: Brazil · Morocco · Scotland · Haiti
-- Real standings: 1.Brazil  2.Morocco  3.Scotland  4.Haiti
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('13-0', 'FT', 2, 0, null, null, now()),  -- Brazil 2-0 Morocco
  ('13-1', 'FT', 0, 2, null, null, now()),  -- Haiti 0-2 Scotland
  ('19-0', 'FT', 3, 0, null, null, now()),  -- Brazil 3-0 Haiti
  ('19-1', 'FT', 0, 1, null, null, now()),  -- Scotland 0-1 Morocco
  ('24-4', 'FT', 0, 1, null, null, now()),  -- Scotland 0-1 Brazil
  ('24-5', 'FT', 2, 0, null, null, now())   -- Morocco 2-0 Haiti
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'C' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 4 — Grupa D: USA · Paraguay · Australia · Turkey
-- Real standings: 1.USA  2.Turkey  3.Australia  4.Paraguay
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('12-2', 'FT', 2, 0, null, null, now()),  -- USA 2-0 Paraguay
  ('12-3', 'FT', 0, 2, null, null, now()),  -- Australia 0-2 Turkey
  ('19-2', 'FT', 2, 0, null, null, now()),  -- Turkey 2-0 Paraguay
  ('19-3', 'FT', 2, 0, null, null, now()),  -- USA 2-0 Australia
  ('25-0', 'FT', 0, 1, null, null, now()),  -- Turkey 0-1 USA
  ('25-1', 'FT', 0, 1, null, null, now())   -- Paraguay 0-1 Australia
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'D' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 5 — Grupa E: Germany · Curaçao · Côte d'Ivoire · Ecuador
-- Real standings: 1.Germany  2.Ecuador  3.Côte d'Ivoire  4.Curaçao
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('14-0', 'FT', 3, 0, null, null, now()),  -- Germany 3-0 Curaçao
  ('14-1', 'FT', 0, 2, null, null, now()),  -- Côte d'Ivoire 0-2 Ecuador
  ('20-0', 'FT', 2, 0, null, null, now()),  -- Germany 2-0 Côte d'Ivoire
  ('20-1', 'FT', 2, 0, null, null, now()),  -- Ecuador 2-0 Curaçao
  ('25-2', 'FT', 0, 1, null, null, now()),  -- Ecuador 0-1 Germany
  ('25-3', 'FT', 0, 1, null, null, now())   -- Curaçao 0-1 Côte d'Ivoire
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'E' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 6 — Grupa F: Netherlands · Japan · Sweden · Tunisia
-- Real standings: 1.Netherlands  2.Japan  3.Sweden  4.Tunisia
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('14-2', 'FT', 2, 1, null, null, now()),  -- Netherlands 2-1 Japan
  ('14-3', 'FT', 2, 0, null, null, now()),  -- Sweden 2-0 Tunisia
  ('20-2', 'FT', 2, 0, null, null, now()),  -- Netherlands 2-0 Sweden
  ('20-3', 'FT', 0, 2, null, null, now()),  -- Tunisia 0-2 Japan
  ('25-4', 'FT', 0, 2, null, null, now()),  -- Tunisia 0-2 Netherlands
  ('25-5', 'FT', 2, 1, null, null, now())   -- Japan 2-1 Sweden
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'F' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 7 — Grupa G: Belgium · Egypt · Iran · New Zealand
-- Real standings: 1.Belgium  2.Iran  3.New Zealand  4.Egypt
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('15-0', 'FT', 2, 0, null, null, now()),  -- Belgium 2-0 Egypt
  ('15-1', 'FT', 2, 0, null, null, now()),  -- Iran 2-0 New Zealand
  ('21-0', 'FT', 2, 1, null, null, now()),  -- Belgium 2-1 Iran
  ('21-1', 'FT', 1, 0, null, null, now()),  -- New Zealand 1-0 Egypt
  ('25-6', 'FT', 0, 2, null, null, now()),  -- New Zealand 0-2 Belgium
  ('25-7', 'FT', 0, 2, null, null, now())   -- Egypt 0-2 Iran
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'G' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 8 — Grupa H: Spain · Cape Verde · Saudi Arabia · Uruguay
-- Real standings: 1.Spain  2.Uruguay  3.Saudi Arabia  4.Cape Verde
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('15-2', 'FT', 3, 0, null, null, now()),  -- Spain 3-0 Cape Verde
  ('15-3', 'FT', 0, 2, null, null, now()),  -- Saudi Arabia 0-2 Uruguay
  ('21-2', 'FT', 2, 0, null, null, now()),  -- Spain 2-0 Saudi Arabia
  ('21-3', 'FT', 2, 0, null, null, now()),  -- Uruguay 2-0 Cape Verde
  ('25-8', 'FT', 0, 1, null, null, now()),  -- Uruguay 0-1 Spain
  ('25-9', 'FT', 0, 1, null, null, now())   -- Cape Verde 0-1 Saudi Arabia
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'H' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 9 — Grupa I: France · Senegal · Iraq · Norway
-- Real standings: 1.France  2.Norway  3.Senegal  4.Iraq
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('16-0', 'FT', 2, 0, null, null, now()),  -- France 2-0 Senegal
  ('16-1', 'FT', 0, 2, null, null, now()),  -- Iraq 0-2 Norway
  ('22-0', 'FT', 3, 0, null, null, now()),  -- France 3-0 Iraq
  ('22-1', 'FT', 2, 0, null, null, now()),  -- Norway 2-0 Senegal
  ('26-0', 'FT', 0, 1, null, null, now()),  -- Norway 0-1 France
  ('26-1', 'FT', 2, 0, null, null, now())   -- Senegal 2-0 Iraq
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'I' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 10 — Grupa J: Argentina · Algeria · Austria · Jordan
-- Real standings: 1.Argentina  2.Austria  3.Algeria  4.Jordan
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('16-2', 'FT', 2, 0, null, null, now()),  -- Argentina 2-0 Algeria
  ('16-3', 'FT', 2, 0, null, null, now()),  -- Austria 2-0 Jordan
  ('22-2', 'FT', 2, 1, null, null, now()),  -- Argentina 2-1 Austria
  ('22-3', 'FT', 0, 1, null, null, now()),  -- Jordan 0-1 Algeria
  ('27-0', 'FT', 0, 2, null, null, now()),  -- Jordan 0-2 Argentina
  ('27-1', 'FT', 0, 1, null, null, now())   -- Algeria 0-1 Austria
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'J' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 11 — Grupa K: Portugal · DR Congo · Uzbekistan · Colombia
-- Real standings: 1.Portugal  2.Colombia  3.Uzbekistan  4.DR Congo
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('17-0', 'FT', 3, 0, null, null, now()),  -- Portugal 3-0 DR Congo
  ('17-1', 'FT', 0, 2, null, null, now()),  -- Uzbekistan 0-2 Colombia
  ('23-0', 'FT', 2, 0, null, null, now()),  -- Portugal 2-0 Uzbekistan
  ('23-1', 'FT', 2, 0, null, null, now()),  -- Colombia 2-0 DR Congo
  ('27-2', 'FT', 0, 1, null, null, now()),  -- Colombia 0-1 Portugal
  ('27-3', 'FT', 0, 1, null, null, now())   -- DR Congo 0-1 Uzbekistan
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'K' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 12 — Grupa L: England · Croatia · Ghana · Panama
-- Real standings: 1.England  2.Croatia  3.Ghana  4.Panama
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.live_scores (match_key, status, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score, updated_at)
VALUES
  ('17-2', 'FT', 2, 1, null, null, now()),  -- England 2-1 Croatia
  ('17-3', 'FT', 1, 0, null, null, now()),  -- Ghana 1-0 Panama
  ('23-2', 'FT', 2, 0, null, null, now()),  -- England 2-0 Ghana
  ('23-3', 'FT', 0, 2, null, null, now()),  -- Panama 0-2 Croatia
  ('27-4', 'FT', 0, 1, null, null, now()),  -- Panama 0-1 England
  ('27-5', 'FT', 2, 0, null, null, now())   -- Croatia 2-0 Ghana
ON CONFLICT (match_key) DO UPDATE SET
  status = excluded.status, regular_time_home_score = excluded.regular_time_home_score,
  regular_time_away_score = excluded.regular_time_away_score, updated_at = excluded.updated_at;
SELECT apply_bracket_scores();
SELECT group_id, rank, team_name, pts, gd FROM get_group_standings() WHERE group_id = 'L' ORDER BY rank;

-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICARE FINALĂ — puncte John Snow după toate grupele
-- ══════════════════════════════════════════════════════════════════════════════
SELECT 'Puncte John Snow dupa toate grupele:' as info;
SELECT s.pred_pts, s.exact_pts, s.total_pts
FROM public.board_scores s
JOIN public.profiles p ON p.id = s.user_id
WHERE p.display_name ILIKE 'john snow' AND s.board_id = 'global';

SELECT 'Clasament global:' as info;
SELECT p.display_name, bs.pred_pts, bs.total_pts
FROM public.board_scores bs
JOIN public.profiles p ON p.id = bs.user_id
WHERE bs.board_id = 'global'
ORDER BY bs.total_pts DESC
LIMIT 10;

-- ══════════════════════════════════════════════════════════════════════════════
-- ROLLBACK — descomenteaza tot blocul si rulează când termini testul
-- ══════════════════════════════════════════════════════════════════════════════

DELETE FROM public.live_scores WHERE match_key IN (
  '11-0','11-1','18-0','18-1','24-0','24-1',
  '12-0','12-1','18-2','18-3','24-2','24-3',
  '13-0','13-1','19-0','19-1','24-4','24-5',
  '12-2','12-3','19-2','19-3','25-0','25-1',
  '14-0','14-1','20-0','20-1','25-2','25-3',
  '14-2','14-3','20-2','20-3','25-4','25-5',
  '15-0','15-1','21-0','21-1','25-6','25-7',
  '15-2','15-3','21-2','21-3','25-8','25-9',
  '16-0','16-1','22-0','22-1','26-0','26-1',
  '16-2','16-3','22-2','22-3','27-0','27-1',
  '17-0','17-1','23-0','23-1','27-2','27-3',
  '17-2','17-3','23-2','23-3','27-4','27-5'
);
UPDATE public.board_scores SET exact_score_pts = 0, group_pts = 0, best3_pts = 0, knockout_pts = 0, pred_pts = 0, exact_pts = 0;
SELECT apply_bracket_scores();
SELECT apply_exact_scores();
SELECT 'Rollback complet. board_scores resetate.' as status;
