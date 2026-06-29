-- ─────────────────────────────────────────────────────────────────────────────
-- cleanup_wrong_r32_picks.sql
-- Rulează după fiecare meci R32 care se termină (FT).
-- Pentru userii cu predicție GREȘITĂ: șterge R32 pick-ul + tot bracketul (R16/QF/SF/F).
-- Pentru userii cu predicție CORECTĂ: nimic — bracketul rămâne intact.
-- Pentru userii fără predicție: nimic — real winner e propagat în frontend.
-- ─────────────────────────────────────────────────────────────────────────────

-- Coloane șterse mereu (indiferent de R32 match):
-- R16-0..7, QF-0..3, SF-0..1, F-0

-- ─── R32-2: South Africa (home) vs Canada (away) — Canada câștigat ───────────
-- Pick greșit = 'home' (South Africa)
UPDATE public.predictions
SET ko_picks = ko_picks
  - 'R32-2'
  - 'R16-0' - 'R16-1' - 'R16-2' - 'R16-3' - 'R16-4' - 'R16-5' - 'R16-6' - 'R16-7'
  - 'QF-0' - 'QF-1' - 'QF-2' - 'QF-3'
  - 'SF-0' - 'SF-1'
  - 'F-0'
WHERE (ko_picks->>'R32-2') = 'home';

-- ─── R32-0: Germany (home) vs Paraguay (away) — completează după meci ────────
-- Exemplu dacă Germany câștigă ('home'): pick greșit = 'away'
-- UPDATE public.predictions
-- SET ko_picks = ko_picks
--   - 'R32-0'
--   - 'R16-0' - 'R16-1' - 'R16-2' - 'R16-3' - 'R16-4' - 'R16-5' - 'R16-6' - 'R16-7'
--   - 'QF-0' - 'QF-1' - 'QF-2' - 'QF-3'
--   - 'SF-0' - 'SF-1'
--   - 'F-0'
-- WHERE (ko_picks->>'R32-0') = 'away';

-- ─── R32-1: Netherlands (home) vs Morocco (away) — completează după meci ─────
-- UPDATE public.predictions
-- SET ko_picks = ko_picks
--   - 'R32-1'
--   - 'R16-0' - ... - 'F-0'
-- WHERE (ko_picks->>'R32-1') = '<side_perdant>';

-- ─── Template pentru restul meciurilor R32 ───────────────────────────────────
-- Înlocuiește R32-X și side_perdant ('home' sau 'away') cu valorile corecte.
-- R32_KEYS order (index → match):
--   0='29-0' Germany vs Paraguay
--   1='30-0' Netherlands vs Morocco
--   2='28-0' South Africa vs Canada  ← DONE
--   3='29-1' Brazil vs Japan
--   4='30-1' France vs Sweden
--   5='31-0' Côte d'Ivoire vs Norway
--   6='30-2' Mexico vs Ecuador
--   7='31-1' England vs DR Congo
--   8='32-0' USA vs Bosnia and Herzegovina
--   9='31-2' Belgium vs Senegal
--  10='32-1' Portugal vs Croatia
--  11='33-0' Spain vs Austria
--  12='32-2' Switzerland vs Algeria
--  13='29-2' Argentina vs Cape Verde
--  14='33-1' Colombia vs Ghana
--  15='33-2' Australia vs Egypt
