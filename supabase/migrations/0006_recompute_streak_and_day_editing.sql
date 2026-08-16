-- ============================================================================
-- Migration 0006: Korrekte Streak-Neuberechnung für das Bearbeiten vergangener Tage
--
-- Voraussetzung für das Bearbeiten alter Tage im Verlauf-Tab: eine Änderung an einem
-- Tag von vor einer Woche muss die Streak-Werte aller danach bereits abgeschlossenen
-- Tage korrekt neu durchrechnen, nicht nur den zuletzt geschlossenen Tag.
--
-- Für ein bereits eingerichtetes Projekt: einmal komplett im Supabase SQL-Editor
-- ausführen. Idempotent (sicher erneut ausführbar).
-- ============================================================================

create or replace function public.recompute_streak_from(p_user_id uuid, p_from_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_running_streak integer;
  v_longest integer;
  v_missing_core integer;
  v_new_streak integer;
begin
  select streak_after into v_running_streak
  from public.daily_logs
  where user_id = p_user_id and log_date < p_from_date and locked = true
  order by log_date desc
  limit 1;
  v_running_streak := coalesce(v_running_streak, 0);

  select longest_streak into v_longest from public.user_stats where user_id = p_user_id;
  v_longest := coalesce(v_longest, 0);

  for r in
    select id, log_date
    from public.daily_logs
    where user_id = p_user_id and log_date >= p_from_date and locked = true
    order by log_date asc
  loop
    select count(*) into v_missing_core
    from public.habit_definitions hd
    left join public.habit_entries he on he.daily_log_id = r.id and he.habit_key = hd.key
    where hd.user_id = p_user_id and hd.is_core = true and hd.active = true
      and (he.status is null or he.status = 'missed');

    if v_missing_core > 0 then
      v_new_streak := 0;
    else
      v_new_streak := v_running_streak + 1;
    end if;

    update public.daily_logs
      set streak_before = v_running_streak,
          streak_after = v_new_streak,
          points_before = null,
          points_after = null
      where id = r.id;

    v_running_streak := v_new_streak;
    v_longest := greatest(v_longest, v_new_streak);
  end loop;

  update public.user_stats
    set current_streak = v_running_streak,
        longest_streak = v_longest,
        updated_at = now()
    where user_id = p_user_id;

  update public.milestones
    set achieved_at = now()
    where user_id = p_user_id and achieved_at is null and target_streak <= v_running_streak;
end;
$$;

create or replace function public.close_day_for_user(p_user_id uuid, p_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_log public.daily_logs;
begin
  select * into v_log from public.daily_logs where user_id = p_user_id and log_date = p_date;
  if not found or v_log.locked then
    return;
  end if;

  update public.daily_logs
    set locked = true, locked_at = now()
    where id = v_log.id;

  perform public.recompute_streak_from(p_user_id, p_date);
end;
$$;

create or replace function public.unlock_day(p_date date, p_pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_pin text;
  v_log public.daily_logs;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select unlock_pin into v_pin from public.settings where user_id = v_uid;
  if v_pin is null or v_pin <> p_pin then
    raise exception 'invalid pin';
  end if;

  select * into v_log from public.daily_logs where user_id = v_uid and log_date = p_date;
  if not found or not v_log.locked then
    return;
  end if;

  update public.daily_logs
    set locked = false,
        locked_at = null,
        streak_after = null,
        points_after = null,
        streak_before = null,
        points_before = null
    where id = v_log.id;

  perform public.recompute_streak_from(v_uid, p_date + 1);
end;
$$;

revoke execute on function public.recompute_streak_from(uuid, date) from public, anon, authenticated;
