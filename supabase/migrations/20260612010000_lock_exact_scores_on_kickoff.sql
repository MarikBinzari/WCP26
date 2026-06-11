create or replace function public.check_exact_score_lock()
returns trigger language plpgsql security definer as $$
declare
  v_match_key text;
  v_status    text;
begin
  select m.match_key into v_match_key
  from public.matches m where m.id = NEW.match_id;

  select ls.status into v_status
  from public.live_scores ls where ls.match_key = v_match_key;

  if v_status is not null and v_status != 'NS' then
    raise exception 'Match % has already started (status: %). Predictions are locked.', v_match_key, v_status;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_lock_exact_scores on public.exact_scores;
create trigger trg_lock_exact_scores
  before insert or update on public.exact_scores
  for each row execute function public.check_exact_score_lock();
