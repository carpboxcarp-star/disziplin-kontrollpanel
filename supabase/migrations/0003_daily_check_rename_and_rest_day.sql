-- ============================================================================
-- Migration 0003: Habit "Kein Gamblen" → "Daily Check" + Rest-Day-Funktion
--
-- Für ein bereits eingerichtetes Projekt: einmal komplett im Supabase SQL-Editor
-- ausführen. Alle Statements sind idempotent (sicher erneut ausführbar).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Habit umbenennen (nur Zeilen mit dem bisherigen Standardlabel, damit ein
--    eventuell schon individuell umbenanntes Label nicht überschrieben wird)
-- ----------------------------------------------------------------------------

update public.habit_definitions
  set label = 'Daily Check'
  where key = 'no_gambling' and label = 'Kein Gamblen';

-- ----------------------------------------------------------------------------
-- 2. Rest-Day-Funktion
-- ----------------------------------------------------------------------------

alter table public.daily_logs add column if not exists is_rest_day boolean not null default false;

create or replace function public.set_rest_day(p_date date, p_is_rest_day boolean)
returns void
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
  v_log public.daily_logs;
begin
  v_log := public.ensure_daily_log(p_date);

  if v_log.locked then
    raise exception 'day is locked';
  end if;

  update public.daily_logs
    set is_rest_day = p_is_rest_day
    where id = v_log.id;

  if p_is_rest_day then
    update public.habit_entries
      set status = 'skipped', skip_note = 'Rest Day', points_awarded = 0, updated_at = now()
      where daily_log_id = v_log.id and habit_key = 'training' and status <> 'done';
  else
    update public.habit_entries
      set status = 'missed', skip_note = null, points_awarded = 0, updated_at = now()
      where daily_log_id = v_log.id and habit_key = 'training'
        and status = 'skipped' and skip_note = 'Rest Day';
  end if;
end;
$$;

grant execute on function public.set_rest_day(date, boolean) to authenticated;
