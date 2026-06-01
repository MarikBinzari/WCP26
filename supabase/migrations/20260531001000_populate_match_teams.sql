-- Populează team1_id și team2_id pentru toate meciurile de grupă
-- Sursa: SCHEDULE din poll-live-scores + teams table

update public.matches as m
set
  team1_id = t1.id,
  team2_id = t2.id
from (values
  -- Grupa A
  ('11-0',  'Mexico',                  'South Africa'),
  ('11-1',  'Korea Republic',          'Czech Republic'),
  ('18-0',  'Czech Republic',          'South Africa'),
  ('18-1',  'Mexico',                  'Korea Republic'),
  ('24-0',  'Czech Republic',          'Mexico'),
  ('24-1',  'South Africa',            'Korea Republic'),
  -- Grupa B
  ('12-0',  'Canada',                  'Bosnia and Herzegovina'),
  ('12-1',  'Qatar',                   'Switzerland'),
  ('18-2',  'Switzerland',             'Bosnia and Herzegovina'),
  ('18-3',  'Canada',                  'Qatar'),
  ('24-2',  'Switzerland',             'Canada'),
  ('24-3',  'Bosnia and Herzegovina',  'Qatar'),
  -- Grupa C
  ('13-0',  'Brazil',                  'Morocco'),
  ('13-1',  'Haiti',                   'Scotland'),
  ('19-0',  'Brazil',                  'Haiti'),
  ('19-1',  'Scotland',                'Morocco'),
  ('24-4',  'Scotland',                'Brazil'),
  ('24-5',  'Morocco',                 'Haiti'),
  -- Grupa D
  ('12-2',  'USA',                     'Paraguay'),
  ('12-3',  'Australia',               'Turkey'),
  ('19-2',  'Turkey',                  'Paraguay'),
  ('19-3',  'USA',                     'Australia'),
  ('25-0',  'Turkey',                  'USA'),
  ('25-1',  'Paraguay',                'Australia'),
  -- Grupa E
  ('14-0',  'Germany',                 'Curaçao'),
  ('14-1',  'Côte d''Ivoire',          'Ecuador'),
  ('20-0',  'Germany',                 'Côte d''Ivoire'),
  ('20-1',  'Ecuador',                 'Curaçao'),
  ('25-2',  'Ecuador',                 'Germany'),
  ('25-3',  'Curaçao',                 'Côte d''Ivoire'),
  -- Grupa F
  ('14-2',  'Netherlands',             'Japan'),
  ('14-3',  'Sweden',                  'Tunisia'),
  ('20-2',  'Netherlands',             'Sweden'),
  ('20-3',  'Tunisia',                 'Japan'),
  ('25-4',  'Tunisia',                 'Netherlands'),
  ('25-5',  'Japan',                   'Sweden'),
  -- Grupa G
  ('15-0',  'Belgium',                 'Egypt'),
  ('15-1',  'Iran',                    'New Zealand'),
  ('21-0',  'Belgium',                 'Iran'),
  ('21-1',  'New Zealand',             'Egypt'),
  ('25-6',  'New Zealand',             'Belgium'),
  ('25-7',  'Egypt',                   'Iran'),
  -- Grupa H
  ('15-2',  'Spain',                   'Cape Verde'),
  ('15-3',  'Saudi Arabia',            'Uruguay'),
  ('21-2',  'Spain',                   'Saudi Arabia'),
  ('21-3',  'Uruguay',                 'Cape Verde'),
  ('25-8',  'Uruguay',                 'Spain'),
  ('25-9',  'Cape Verde',              'Saudi Arabia'),
  -- Grupa I
  ('16-0',  'France',                  'Senegal'),
  ('16-1',  'Iraq',                    'Norway'),
  ('22-0',  'France',                  'Iraq'),
  ('22-1',  'Norway',                  'Senegal'),
  ('26-0',  'Norway',                  'France'),
  ('26-1',  'Senegal',                 'Iraq'),
  -- Grupa J
  ('16-2',  'Argentina',               'Algeria'),
  ('16-3',  'Austria',                 'Jordan'),
  ('22-2',  'Argentina',               'Austria'),
  ('22-3',  'Jordan',                  'Algeria'),
  ('27-0',  'Jordan',                  'Argentina'),
  ('27-1',  'Algeria',                 'Austria'),
  -- Grupa K
  ('17-0',  'Portugal',                'DR Congo'),
  ('17-1',  'Uzbekistan',              'Colombia'),
  ('23-0',  'Portugal',                'Uzbekistan'),
  ('23-1',  'Colombia',                'DR Congo'),
  ('27-2',  'Colombia',                'Portugal'),
  ('27-3',  'DR Congo',                'Uzbekistan'),
  -- Grupa L
  ('17-2',  'England',                 'Croatia'),
  ('17-3',  'Ghana',                   'Panama'),
  ('23-2',  'England',                 'Ghana'),
  ('23-3',  'Panama',                  'Croatia'),
  ('27-4',  'Panama',                  'England'),
  ('27-5',  'Croatia',                 'Ghana')
) as v(match_key, team1_name, team2_name)
join public.teams t1 on t1.name = v.team1_name
join public.teams t2 on t2.name = v.team2_name
where m.match_key = v.match_key;
