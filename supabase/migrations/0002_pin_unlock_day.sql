-- ============================================================================
-- Migration 0002: PIN-geschützte Tagesentsperrung
--
-- Für ein bereits eingerichtetes Projekt: einmal komplett im Supabase SQL-Editor
-- ausführen. Alle Statements sind idempotent (sicher erneut ausführbar).
-- ============================================================================

alter table public.daily_logs add column if not exists streak_before integer;
alter table public.daily_logs add column if not exists points_before integer;

alter table public.settings add column if not exists unlock_pin text not null default '1234';
alter table public.settings drop constraint if exists settings_unlock_pin_check;
alter table public.settings add constraint settings_unlock_pin_check check (unlock_pin ~ '^[0-9]{4}$');

-- close_day_for_user: jetzt zusätzlich streak_before/points_before mitschreiben
create or replace function public.close_day_for_user(p_user_id uuid, p_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_log public.daily_logs;
  v_missing_core integer;
  v_stats public.user_stats;
  v_new_streak integer;
begin
  select * into v_log from public.daily_logs where user_id = p_user_id and log_date = p_date;
  if not found or v_log.locked then
    return;
  end if;

  select count(*) into v_missing_core
  from public.habit_definitions hd
  left join public.habit_entries he on he.daily_log_id = v_log.id and he.habit_key = hd.key
  where hd.user_id = p_user_id and hd.is_core = true and hd.active = true
    and (he.status is null or he.status = 'missed');

  select * into v_stats from public.user_stats where user_id = p_user_id;

  if v_missing_core > 0 then
    v_new_streak := 0;
  else
    v_new_streak := v_stats.current_streak + 1;
  end if;

  update public.user_stats
    set current_streak = v_new_streak,
        longest_streak = greatest(longest_streak, v_new_streak),
        updated_at = now()
    where user_id = p_user_id;

  update public.milestones
    set achieved_at = now()
    where user_id = p_user_id and achieved_at is null and target_streak <= v_new_streak;

  update public.daily_logs
    set locked = true,
        locked_at = now(),
        streak_before = v_stats.current_streak,
        points_before = v_stats.total_points,
        streak_after = v_new_streak,
        points_after = (select total_points from public.user_stats where user_id = p_user_id)
    where id = v_log.id;
end;
$$;

create or replace function public.unlock_day(p_date date, p_pin text)
returns void
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
  v_pin text;
  v_log public.daily_logs;
begin
  select unlock_pin into v_pin from public.settings where user_id = v_uid;
  if v_pin is null or v_pin <> p_pin then
    raise exception 'invalid pin';
  end if;

  select * into v_log from public.daily_logs where user_id = v_uid and log_date = p_date;
  if not found or not v_log.locked then
    return;
  end if;

  update public.user_stats
    set current_streak = coalesce(v_log.streak_before, current_streak),
        updated_at = now()
    where user_id = v_uid;

  update public.daily_logs
    set locked = false,
        locked_at = null,
        streak_after = null,
        points_after = null,
        streak_before = null,
        points_before = null
    where id = v_log.id;
end;
$$;

grant execute on function public.unlock_day(date, text) to authenticated;
