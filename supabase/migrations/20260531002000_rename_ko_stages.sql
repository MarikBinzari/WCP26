-- Redenumire stage-uri KO ca să se alinieze cu app-ul și score_exact_picks()
-- DB vechi → DB nou → App (ko_picks)
-- r16     → r32    → R32-0..15
-- qf      → r16    → R16-0..7
-- sf      → qf     → QF-0..3
-- 3rd     → sf     → SF-0..1
-- final   → final  → F-0

update public.matches set stage = 'r32' where stage = 'r16';
update public.matches set stage = 'r16' where stage = 'qf';
update public.matches set stage = 'qf'  where stage = 'sf';
update public.matches set stage = 'sf'  where stage = '3rd';
