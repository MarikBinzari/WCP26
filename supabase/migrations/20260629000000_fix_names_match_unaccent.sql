-- Fix: _names_match now strips accents so "O. Dembele" matches "Ousmane Dembélé"
create extension if not exists unaccent;

create or replace function public._names_match(abbreviated text, full_name text)
returns boolean language sql immutable as $$
  select
    unaccent(lower(abbreviated)) = unaccent(lower(full_name))
    or (
      abbreviated like '%. %'
      and left(unaccent(full_name), 1) = left(unaccent(abbreviated), 1)
      and unaccent(full_name) ilike '%' || unaccent(split_part(abbreviated, '. ', 2))
    )
    or (
      full_name like '%. %'
      and left(unaccent(abbreviated), 1) = left(unaccent(full_name), 1)
      and unaccent(abbreviated) ilike '%' || unaccent(split_part(full_name, '. ', 2))
    )
$$;

-- Recalculate all top_scorer_pts with the fixed matching
select public.auto_score_special_picks();
