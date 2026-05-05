-- ─── RESET ───────────────────────────────────────────────────────────────────
drop table if exists public.exact_scores cascade;
drop table if exists public.matches cascade;
drop table if exists public.match_days cascade;
drop table if exists public.teams cascade;

-- ─── TEAMS ───────────────────────────────────────────────────────────────────
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  flag_emoji text,
  color_primary text,
  color_secondary text,
  group_id text
);

insert into public.teams (name, flag_emoji, color_primary, color_secondary, group_id) values
('Mexico','🇲🇽','#006847','#CE1126','A'),
('South Africa','🇿🇦','#007A4D','#FFB612','A'),
('Korea Republic','🇰🇷','#C60C30','#003478','A'),
('Czech Republic','🇨🇿','#D7141A','#11457E','A'),
('Canada','🇨🇦','#FF0000','#FFFFFF','B'),
('Bosnia and Herzegovina','🇧🇦','#002395','#FFCC00','B'),
('Qatar','🇶🇦','#8D1B3D','#FFFFFF','B'),
('Switzerland','🇨🇭','#FF0000','#FFFFFF','B'),
('Brazil','🇧🇷','#009C3B','#FFDF00','C'),
('Morocco','🇲🇦','#C1272D','#006233','C'),
('Haiti','🇭🇹','#00209F','#D21034','C'),
('Scotland','🏴󠁧󠁢󠁳󠁣󠁴󠁿','#003F87','#FFFFFF','C'),
('USA','🇺🇸','#002868','#BF0A30','D'),
('Paraguay','🇵🇾','#D52B1E','#0038A8','D'),
('Australia','🇦🇺','#00843D','#FFCD00','D'),
('Turkey','🇹🇷','#E30A17','#FFFFFF','D'),
('Germany','🇩🇪','#000000','#DD0000','E'),
('Curaçao','🇨🇼','#002B7F','#F9E814','E'),
('Côte d''Ivoire','🇨🇮','#F77F00','#009A44','E'),
('Ecuador','🇪🇨','#FFD100','#003DA5','E'),
('Netherlands','🇳🇱','#FF4F00','#003DA5','F'),
('Japan','🇯🇵','#FFFFFF','#BC002D','F'),
('Sweden','🇸🇪','#006AA7','#FECC02','F'),
('Tunisia','🇹🇳','#E70013','#FFFFFF','F'),
('Belgium','🇧🇪','#000000','#FAE042','G'),
('Egypt','🇪🇬','#CE1126','#FFFFFF','G'),
('Iran','🇮🇷','#239F40','#DA0000','G'),
('New Zealand','🇳🇿','#FFFFFF','#00247D','G'),
('Spain','🇪🇸','#AA151B','#F1BF00','H'),
('Cape Verde','🇨🇻','#003893','#CF2027','H'),
('Saudi Arabia','🇸🇦','#006C35','#FFFFFF','H'),
('Uruguay','🇺🇾','#5EB6E4','#FFFFFF','H'),
('France','🇫🇷','#002395','#ED2939','I'),
('Senegal','🇸🇳','#00853F','#FDEF42','I'),
('Iraq','🇮🇶','#CE1126','#FFFFFF','I'),
('Norway','🇳🇴','#EF2B2D','#002868','I'),
('Argentina','🇦🇷','#74ACDF','#FFFFFF','J'),
('Algeria','🇩🇿','#006233','#D21034','J'),
('Austria','🇦🇹','#ED2939','#FFFFFF','J'),
('Jordan','🇯🇴','#007A3D','#CE1126','J'),
('Portugal','🇵🇹','#006600','#FF0000','K'),
('DR Congo','🇨🇩','#007FFF','#FFCC00','K'),
('Uzbekistan','🇺🇿','#1EB53A','#CE1126','K'),
('Colombia','🇨🇴','#FCD116','#003087','K'),
('England','🏴󠁧󠁢󠁥󠁧󠁿','#FFFFFF','#CF081F','L'),
('Croatia','🇭🇷','#171796','#FF0000','L'),
('Ghana','🇬🇭','#006B3F','#FCD116','L'),
('Panama','🇵🇦','#FFFFFF','#DA121A','L');

-- ─── MATCH DAYS ──────────────────────────────────────────────────────────────
create table public.match_days (
  id uuid primary key default gen_random_uuid(),
  day_number int not null unique,   -- encoding: June N = N, July N = N+30
  match_date date not null,
  label text not null
);

insert into public.match_days (day_number, match_date, label) values
(11,'2026-06-11','11 June'), (12,'2026-06-12','12 June'),
(13,'2026-06-13','13 June'), (14,'2026-06-14','14 June'),
(15,'2026-06-15','15 June'), (16,'2026-06-16','16 June'),
(17,'2026-06-17','17 June'), (18,'2026-06-18','18 June'),
(19,'2026-06-19','19 June'), (20,'2026-06-20','20 June'),
(21,'2026-06-21','21 June'), (22,'2026-06-22','22 June'),
(23,'2026-06-23','23 June'), (24,'2026-06-24','24 June'),
(25,'2026-06-25','25 June'), (26,'2026-06-26','26 June'),
(27,'2026-06-27','27 June'), (29,'2026-06-29','29 June'),
(30,'2026-06-30','30 June'), (31,'2026-07-01','1 July'),
(32,'2026-07-02','2 July'),  (33,'2026-07-03','3 July'),
(34,'2026-07-04','4 July'),  (35,'2026-07-05','5 July'),
(36,'2026-07-06','6 July'),  (38,'2026-07-08','8 July'),
(39,'2026-07-09','9 July'),  (40,'2026-07-10','10 July'),
(41,'2026-07-11','11 July'), (44,'2026-07-14','14 July'),
(45,'2026-07-15','15 July'), (48,'2026-07-18','18 July'),
(49,'2026-07-19','19 July');

-- ─── MATCHES ─────────────────────────────────────────────────────────────────
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  match_key text unique not null,                                  -- "11-0" compatibil cu app
  match_day_id uuid references public.match_days on delete cascade not null,
  match_time text not null,
  stage text not null check (stage in ('group','r16','qf','sf','3rd','final')),
  group_id text,
  team1_id uuid references public.teams,
  team2_id uuid references public.teams,
  team1_slot text,   -- knockout placeholder: "1A", "W29-1" etc.
  team2_slot text,
  venue text,
  team1_score int,   -- null până se joacă
  team2_score int,
  status text default 'NS' check (status in ('NS','LIVE','FT')),
  match_order int default 0
);

-- ── Etapa 1 ───────────────────────────────────────────────────────────────────
insert into public.matches (match_key,match_day_id,match_time,stage,group_id,team1_id,team2_id,venue,match_order) values
('11-0',(select id from public.match_days where day_number=11),'16:00','group','A',(select id from public.teams where name='Mexico'),(select id from public.teams where name='South Africa'),'Estadio Azteca',0),
('11-1',(select id from public.match_days where day_number=11),'20:00','group','A',(select id from public.teams where name='Korea Republic'),(select id from public.teams where name='Czech Republic'),'Estadio Akron',1),
('12-0',(select id from public.match_days where day_number=12),'13:00','group','B',(select id from public.teams where name='Canada'),(select id from public.teams where name='Bosnia and Herzegovina'),'BMO Field',0),
('12-1',(select id from public.match_days where day_number=12),'16:00','group','B',(select id from public.teams where name='Qatar'),(select id from public.teams where name='Switzerland'),'Levi''s Stadium',1),
('12-2',(select id from public.match_days where day_number=12),'19:00','group','D',(select id from public.teams where name='USA'),(select id from public.teams where name='Paraguay'),'SoFi Stadium',2),
('12-3',(select id from public.match_days where day_number=12),'22:00','group','D',(select id from public.teams where name='Australia'),(select id from public.teams where name='Turkey'),'BC Place',3),
('13-0',(select id from public.match_days where day_number=13),'16:00','group','C',(select id from public.teams where name='Brazil'),(select id from public.teams where name='Morocco'),'Gillette Stadium',0),
('13-1',(select id from public.match_days where day_number=13),'20:00','group','C',(select id from public.teams where name='Haiti'),(select id from public.teams where name='Scotland'),'MetLife Stadium',1),
('14-0',(select id from public.match_days where day_number=14),'13:00','group','E',(select id from public.teams where name='Germany'),(select id from public.teams where name='Curaçao'),'Lincoln Financial Field',0),
('14-1',(select id from public.match_days where day_number=14),'16:00','group','E',(select id from public.teams where name='Côte d''Ivoire'),(select id from public.teams where name='Ecuador'),'NRG Stadium',1),
('14-2',(select id from public.match_days where day_number=14),'19:00','group','F',(select id from public.teams where name='Netherlands'),(select id from public.teams where name='Japan'),'AT&T Stadium',2),
('14-3',(select id from public.match_days where day_number=14),'22:00','group','F',(select id from public.teams where name='Sweden'),(select id from public.teams where name='Tunisia'),'Estadio BBVA',3),
('15-0',(select id from public.match_days where day_number=15),'13:00','group','G',(select id from public.teams where name='Belgium'),(select id from public.teams where name='Egypt'),'SoFi Stadium',0),
('15-1',(select id from public.match_days where day_number=15),'16:00','group','G',(select id from public.teams where name='Iran'),(select id from public.teams where name='New Zealand'),'Lumen Field',1),
('15-2',(select id from public.match_days where day_number=15),'19:00','group','H',(select id from public.teams where name='Spain'),(select id from public.teams where name='Cape Verde'),'Hard Rock Stadium',2),
('15-3',(select id from public.match_days where day_number=15),'22:00','group','H',(select id from public.teams where name='Saudi Arabia'),(select id from public.teams where name='Uruguay'),'Mercedes-Benz Stadium',3),
('16-0',(select id from public.match_days where day_number=16),'13:00','group','I',(select id from public.teams where name='France'),(select id from public.teams where name='Senegal'),'MetLife Stadium',0),
('16-1',(select id from public.match_days where day_number=16),'16:00','group','I',(select id from public.teams where name='Iraq'),(select id from public.teams where name='Norway'),'Gillette Stadium',1),
('16-2',(select id from public.match_days where day_number=16),'19:00','group','J',(select id from public.teams where name='Argentina'),(select id from public.teams where name='Algeria'),'Arrowhead Stadium',2),
('16-3',(select id from public.match_days where day_number=16),'22:00','group','J',(select id from public.teams where name='Austria'),(select id from public.teams where name='Jordan'),'Levi''s Stadium',3),
('17-0',(select id from public.match_days where day_number=17),'13:00','group','K',(select id from public.teams where name='Portugal'),(select id from public.teams where name='DR Congo'),'NRG Stadium',0),
('17-1',(select id from public.match_days where day_number=17),'16:00','group','K',(select id from public.teams where name='Uzbekistan'),(select id from public.teams where name='Colombia'),'Estadio Azteca',1),
('17-2',(select id from public.match_days where day_number=17),'19:00','group','L',(select id from public.teams where name='England'),(select id from public.teams where name='Croatia'),'BMO Field',2),
('17-3',(select id from public.match_days where day_number=17),'22:00','group','L',(select id from public.teams where name='Ghana'),(select id from public.teams where name='Panama'),'AT&T Stadium',3);

-- ── Etapa 2 ───────────────────────────────────────────────────────────────────
insert into public.matches (match_key,match_day_id,match_time,stage,group_id,team1_id,team2_id,venue,match_order) values
('18-0',(select id from public.match_days where day_number=18),'13:00','group','A',(select id from public.teams where name='Czech Republic'),(select id from public.teams where name='South Africa'),'Mercedes-Benz Stadium',0),
('18-1',(select id from public.match_days where day_number=18),'16:00','group','A',(select id from public.teams where name='Mexico'),(select id from public.teams where name='Korea Republic'),'Estadio Akron',1),
('18-2',(select id from public.match_days where day_number=18),'19:00','group','B',(select id from public.teams where name='Switzerland'),(select id from public.teams where name='Bosnia and Herzegovina'),'SoFi Stadium',2),
('18-3',(select id from public.match_days where day_number=18),'22:00','group','B',(select id from public.teams where name='Canada'),(select id from public.teams where name='Qatar'),'BC Place',3),
('19-0',(select id from public.match_days where day_number=19),'13:00','group','C',(select id from public.teams where name='Brazil'),(select id from public.teams where name='Haiti'),'Lincoln Financial Field',0),
('19-1',(select id from public.match_days where day_number=19),'16:00','group','C',(select id from public.teams where name='Scotland'),(select id from public.teams where name='Morocco'),'Gillette Stadium',1),
('19-2',(select id from public.match_days where day_number=19),'19:00','group','D',(select id from public.teams where name='Turkey'),(select id from public.teams where name='Paraguay'),'Levi''s Stadium',2),
('19-3',(select id from public.match_days where day_number=19),'22:00','group','D',(select id from public.teams where name='USA'),(select id from public.teams where name='Australia'),'Lumen Field',3),
('20-0',(select id from public.match_days where day_number=20),'13:00','group','E',(select id from public.teams where name='Germany'),(select id from public.teams where name='Côte d''Ivoire'),'BMO Field',0),
('20-1',(select id from public.match_days where day_number=20),'16:00','group','E',(select id from public.teams where name='Ecuador'),(select id from public.teams where name='Curaçao'),'Arrowhead Stadium',1),
('20-2',(select id from public.match_days where day_number=20),'19:00','group','F',(select id from public.teams where name='Netherlands'),(select id from public.teams where name='Sweden'),'NRG Stadium',2),
('20-3',(select id from public.match_days where day_number=20),'22:00','group','F',(select id from public.teams where name='Tunisia'),(select id from public.teams where name='Japan'),'Estadio BBVA',3),
('21-0',(select id from public.match_days where day_number=21),'13:00','group','G',(select id from public.teams where name='Belgium'),(select id from public.teams where name='Iran'),'SoFi Stadium',0),
('21-1',(select id from public.match_days where day_number=21),'16:00','group','G',(select id from public.teams where name='New Zealand'),(select id from public.teams where name='Egypt'),'BC Place',1),
('21-2',(select id from public.match_days where day_number=21),'19:00','group','H',(select id from public.teams where name='Spain'),(select id from public.teams where name='Saudi Arabia'),'Hard Rock Stadium',2),
('21-3',(select id from public.match_days where day_number=21),'22:00','group','H',(select id from public.teams where name='Uruguay'),(select id from public.teams where name='Cape Verde'),'Mercedes-Benz Stadium',3),
('22-0',(select id from public.match_days where day_number=22),'13:00','group','I',(select id from public.teams where name='France'),(select id from public.teams where name='Iraq'),'MetLife Stadium',0),
('22-1',(select id from public.match_days where day_number=22),'16:00','group','I',(select id from public.teams where name='Norway'),(select id from public.teams where name='Senegal'),'Lincoln Financial Field',1),
('22-2',(select id from public.match_days where day_number=22),'19:00','group','J',(select id from public.teams where name='Argentina'),(select id from public.teams where name='Austria'),'AT&T Stadium',2),
('22-3',(select id from public.match_days where day_number=22),'22:00','group','J',(select id from public.teams where name='Jordan'),(select id from public.teams where name='Algeria'),'Levi''s Stadium',3),
('23-0',(select id from public.match_days where day_number=23),'13:00','group','K',(select id from public.teams where name='Portugal'),(select id from public.teams where name='Uzbekistan'),'NRG Stadium',0),
('23-1',(select id from public.match_days where day_number=23),'16:00','group','K',(select id from public.teams where name='Colombia'),(select id from public.teams where name='DR Congo'),'Estadio Akron',1),
('23-2',(select id from public.match_days where day_number=23),'19:00','group','L',(select id from public.teams where name='England'),(select id from public.teams where name='Ghana'),'Gillette Stadium',2),
('23-3',(select id from public.match_days where day_number=23),'22:00','group','L',(select id from public.teams where name='Panama'),(select id from public.teams where name='Croatia'),'BMO Field',3);

-- ── Etapa 3 ───────────────────────────────────────────────────────────────────
insert into public.matches (match_key,match_day_id,match_time,stage,group_id,team1_id,team2_id,venue,match_order) values
('24-0',(select id from public.match_days where day_number=24),'15:00','group','A',(select id from public.teams where name='Czech Republic'),(select id from public.teams where name='Mexico'),'Estadio Azteca',0),
('24-1',(select id from public.match_days where day_number=24),'15:00','group','A',(select id from public.teams where name='South Africa'),(select id from public.teams where name='Korea Republic'),'Estadio BBVA',1),
('24-2',(select id from public.match_days where day_number=24),'19:00','group','B',(select id from public.teams where name='Switzerland'),(select id from public.teams where name='Canada'),'BC Place',2),
('24-3',(select id from public.match_days where day_number=24),'19:00','group','B',(select id from public.teams where name='Bosnia and Herzegovina'),(select id from public.teams where name='Qatar'),'Lumen Field',3),
('24-4',(select id from public.match_days where day_number=24),'19:00','group','C',(select id from public.teams where name='Scotland'),(select id from public.teams where name='Brazil'),'Hard Rock Stadium',4),
('24-5',(select id from public.match_days where day_number=24),'19:00','group','C',(select id from public.teams where name='Morocco'),(select id from public.teams where name='Haiti'),'Mercedes-Benz Stadium',5),
('25-0',(select id from public.match_days where day_number=25),'15:00','group','D',(select id from public.teams where name='Turkey'),(select id from public.teams where name='USA'),'SoFi Stadium',0),
('25-1',(select id from public.match_days where day_number=25),'15:00','group','D',(select id from public.teams where name='Paraguay'),(select id from public.teams where name='Australia'),'Levi''s Stadium',1),
('25-2',(select id from public.match_days where day_number=25),'15:00','group','E',(select id from public.teams where name='Ecuador'),(select id from public.teams where name='Germany'),'Lincoln Financial Field',2),
('25-3',(select id from public.match_days where day_number=25),'15:00','group','E',(select id from public.teams where name='Curaçao'),(select id from public.teams where name='Côte d''Ivoire'),'MetLife Stadium',3),
('25-4',(select id from public.match_days where day_number=25),'19:00','group','F',(select id from public.teams where name='Tunisia'),(select id from public.teams where name='Netherlands'),'AT&T Stadium',4),
('25-5',(select id from public.match_days where day_number=25),'19:00','group','F',(select id from public.teams where name='Japan'),(select id from public.teams where name='Sweden'),'Arrowhead Stadium',5),
('25-6',(select id from public.match_days where day_number=25),'19:00','group','G',(select id from public.teams where name='New Zealand'),(select id from public.teams where name='Belgium'),'Lumen Field',6),
('25-7',(select id from public.match_days where day_number=25),'19:00','group','G',(select id from public.teams where name='Egypt'),(select id from public.teams where name='Iran'),'BC Place',7),
('25-8',(select id from public.match_days where day_number=25),'19:00','group','H',(select id from public.teams where name='Uruguay'),(select id from public.teams where name='Spain'),'NRG Stadium',8),
('25-9',(select id from public.match_days where day_number=25),'19:00','group','H',(select id from public.teams where name='Cape Verde'),(select id from public.teams where name='Saudi Arabia'),'Estadio Akron',9),
('26-0',(select id from public.match_days where day_number=26),'15:00','group','I',(select id from public.teams where name='Norway'),(select id from public.teams where name='France'),'Gillette Stadium',0),
('26-1',(select id from public.match_days where day_number=26),'15:00','group','I',(select id from public.teams where name='Senegal'),(select id from public.teams where name='Iraq'),'BMO Field',1),
('26-2',(select id from public.match_days where day_number=26),'19:00','group','K',(select id from public.teams where name='Colombia'),(select id from public.teams where name='Portugal'),'Hard Rock Stadium',2),
('26-3',(select id from public.match_days where day_number=26),'19:00','group','K',(select id from public.teams where name='DR Congo'),(select id from public.teams where name='Uzbekistan'),'Mercedes-Benz Stadium',3),
('26-4',(select id from public.match_days where day_number=26),'19:00','group','L',(select id from public.teams where name='Panama'),(select id from public.teams where name='England'),'MetLife Stadium',4),
('26-5',(select id from public.match_days where day_number=26),'19:00','group','L',(select id from public.teams where name='Croatia'),(select id from public.teams where name='Ghana'),'Lincoln Financial Field',5),
('27-0',(select id from public.match_days where day_number=27),'19:00','group','J',(select id from public.teams where name='Jordan'),(select id from public.teams where name='Argentina'),'Arrowhead Stadium',0),
('27-1',(select id from public.match_days where day_number=27),'19:00','group','J',(select id from public.teams where name='Algeria'),(select id from public.teams where name='Austria'),'AT&T Stadium',1);

-- ── Knockout ──────────────────────────────────────────────────────────────────
insert into public.matches (match_key,match_day_id,match_time,stage,team1_slot,team2_slot,match_order) values
('29-0',(select id from public.match_days where day_number=29),'15:00','r16','1A','2C',0),
('29-1',(select id from public.match_days where day_number=29),'19:00','r16','1C','2A',1),
('30-0',(select id from public.match_days where day_number=30),'15:00','r16','1B','2D',0),
('30-1',(select id from public.match_days where day_number=30),'19:00','r16','1D','2B',1),
('31-0',(select id from public.match_days where day_number=31),'15:00','r16','1E','2G',0),
('31-1',(select id from public.match_days where day_number=31),'19:00','r16','1G','2E',1),
('32-0',(select id from public.match_days where day_number=32),'15:00','r16','1F','2H',0),
('32-1',(select id from public.match_days where day_number=32),'19:00','r16','1H','2F',1),
('33-0',(select id from public.match_days where day_number=33),'15:00','r16','1I','2K',0),
('33-1',(select id from public.match_days where day_number=33),'19:00','r16','1K','2I',1),
('34-0',(select id from public.match_days where day_number=34),'15:00','r16','1J','2L',0),
('34-1',(select id from public.match_days where day_number=34),'19:00','r16','1L','2J',1),
('35-0',(select id from public.match_days where day_number=35),'15:00','r16','1best3','2best3',0),
('35-1',(select id from public.match_days where day_number=35),'19:00','r16','3best3','4best3',1),
('36-0',(select id from public.match_days where day_number=36),'15:00','r16','5best3','6best3',0),
('36-1',(select id from public.match_days where day_number=36),'19:00','r16','7best3','8best3',1),
('38-0',(select id from public.match_days where day_number=38),'15:00','qf','W29-1','W29-2',0),
('38-1',(select id from public.match_days where day_number=38),'19:00','qf','W30-1','W30-2',1),
('39-0',(select id from public.match_days where day_number=39),'15:00','qf','W31-1','W31-2',0),
('39-1',(select id from public.match_days where day_number=39),'19:00','qf','W32-1','W32-2',1),
('40-0',(select id from public.match_days where day_number=40),'15:00','qf','W33-1','W33-2',0),
('40-1',(select id from public.match_days where day_number=40),'19:00','qf','W34-1','W34-2',1),
('41-0',(select id from public.match_days where day_number=41),'15:00','qf','W35-1','W35-2',0),
('41-1',(select id from public.match_days where day_number=41),'19:00','qf','W36-1','W36-2',1),
('44-0',(select id from public.match_days where day_number=44),'19:00','sf','QF1','QF2',0),
('44-1',(select id from public.match_days where day_number=44),'19:00','sf','QF3','QF4',1),
('45-0',(select id from public.match_days where day_number=45),'19:00','sf','QF5','QF6',0),
('45-1',(select id from public.match_days where day_number=45),'19:00','sf','QF7','QF8',1),
('48-0',(select id from public.match_days where day_number=48),'15:00','3rd','SF L1','SF L2',0),
('48-1',(select id from public.match_days where day_number=48),'19:00','3rd','SF L3','SF L4',1),
('49-0',(select id from public.match_days where day_number=49),'19:00','final','SF W1','SF W2',0);

-- ─── EXACT SCORES ────────────────────────────────────────────────────────────
create table public.exact_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  board_id text not null,
  match_id uuid references public.matches on delete cascade not null,
  team1_score int not null,
  team2_score int not null,
  updated_at timestamptz default now(),
  unique(user_id, board_id, match_id)
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.teams enable row level security;
alter table public.match_days enable row level security;
alter table public.matches enable row level security;
alter table public.exact_scores enable row level security;

create policy "Anyone reads teams"      on public.teams      for select using (true);
create policy "Anyone reads match_days" on public.match_days for select using (true);
create policy "Anyone reads matches"    on public.matches    for select using (true);

create policy "Users see own exact scores"    on public.exact_scores for select using (auth.uid() = user_id);
create policy "Users insert exact scores"     on public.exact_scores for insert with check (auth.uid() = user_id);
create policy "Users update exact scores"     on public.exact_scores for update using (auth.uid() = user_id);
