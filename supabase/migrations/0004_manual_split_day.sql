-- ============================================================================
-- Migration 0004: Trainingstag manuell vor-/zurückschalten
--
-- Für ein bereits eingerichtetes Projekt: einmal komplett im Supabase SQL-Editor
-- ausführen. Alle Statements sind idempotent (sicher erneut ausführbar).
-- ============================================================================

create or replace function public.prev_split_day(p_split text)
returns text
language sql
immutable
as $$
  select case p_split
    when 'push' then 'legs'
    when 'pull' then 'push'
    when 'legs' then 'pull'
    else 'legs'
  end;
$$;

create or replace function public.set_split_day(p_target text)
returns void
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
begin
  if p_target not in ('push', 'pull', 'legs') then
    raise exception 'invalid split %', p_target;
  end if;

  update public.split_rotation_state
    set last_completed_split = public.prev_split_day(p_target),
        last_completed_date = null
    where user_id = v_uid;
end;
$$;

grant execute on function public.set_split_day(text) to authenticated;
grant execute on function public.prev_split_day(text) to authenticated;
