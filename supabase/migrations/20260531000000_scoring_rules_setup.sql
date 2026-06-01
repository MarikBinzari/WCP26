create table if not exists public.scoring_rules (
  id         serial primary key,
  type       text not null,
  phase      text not null,
  points     int  not null default 0,
  sort_order int  not null default 0
);

create unique index if not exists scoring_rules_type_phase_idx
  on public.scoring_rules(type, phase);

alter table public.scoring_rules enable row level security;

create policy "public_read_scoring_rules"
  on public.scoring_rules for select using (true);

create policy "service_write_scoring_rules"
  on public.scoring_rules for all
  using (auth.role() = 'service_role');

insert into public.scoring_rules (type, phase, points, sort_order) values
  ('prediction', 'group1st',  20,  1),
  ('prediction', 'group2nd',  15,  2),
  ('prediction', 'group3rd',  10,  3),
  ('prediction', 'best3',      5,  4),
  ('prediction', 'r32',       10,  5),
  ('prediction', 'r16',       20,  6),
  ('prediction', 'qf',        40,  7),
  ('prediction', 'sf',        60,  8),
  ('prediction', 'final',    100,  9),
  ('exact_score', 'group_result',       30,  1),
  ('exact_score', 'group_exact',        90,  2),
  ('exact_score', 'r32_result',         35,  3),
  ('exact_score', 'r32_exact_bonus',    15,  4),
  ('exact_score', 'r16_result',         40,  5),
  ('exact_score', 'r16_exact_bonus',    20,  6),
  ('exact_score', 'qf_result',          60,  7),
  ('exact_score', 'qf_exact_bonus',     30,  8),
  ('exact_score', 'sf_result',          90,  9),
  ('exact_score', 'sf_exact_bonus',     40, 10),
  ('exact_score', 'final_result',      120, 11),
  ('exact_score', 'final_exact_bonus',  50, 12)
on conflict (type, phase) do update set points = excluded.points;
