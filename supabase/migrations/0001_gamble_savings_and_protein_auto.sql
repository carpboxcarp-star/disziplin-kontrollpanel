-- ============================================================================
-- Migration 0001: Automatischer Gamble-Ersparnis-Abzug + automatisches
-- Abhaken des Protein-Habits.
--
-- Für ein BEREITS mit supabase/schema.sql eingerichtetes Projekt: einmal komplett
-- im Supabase SQL-Editor ausführen. Alle Statements sind idempotent (sicher erneut
-- ausführbar), falls du sie versehentlich zweimal laufen lässt.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Neue Settings-Spalten
-- ----------------------------------------------------------------------------

alter table public.settings add column if not exists gamble_savings_amount numeric(10, 2) not null default 45;
alter table public.settings add column if not exists last_auto_saving_date date;

-- ----------------------------------------------------------------------------
-- 2. set_habit_status: manuelle Änderungen am "protein"-Habit blockieren
--    (wird jetzt ausschließlich automatisch über sync_protein_habit() gesetzt)
-- ----------------------------------------------------------------------------

create or replace function public.set_habit_status(
  p_date date,
  p_habit_key text,
  p_status text,
  p_skip_note text default null
)
returns public.habit_entries
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
  v_log public.daily_logs;
  v_def public.habit_definitions;
  v_entry public.habit_entries;
  v_points integer := 0;
  v_rot public.split_rotation_state;
  v_current_split text;
begin
  if p_status not in ('done', 'skipped', 'missed') then
    raise exception 'invalid status %', p_status;
  end if;

  if p_habit_key = 'protein' then
    raise exception 'protein habit is managed automatically, see sync_protein_habit()';
  end if;

  v_log := public.ensure_daily_log(p_date);

  if v_log.locked then
    raise exception 'day is locked';
  end if;

  select * into v_def from public.habit_definitions where user_id = v_uid and key = p_habit_key;
  if not found then
    raise exception 'unknown habit %', p_habit_key;
  end if;

  if p_status = 'done' then
    v_points := v_def.points;
  else
    v_points := 0;
  end if;

  update public.habit_entries
    set status = p_status,
        skip_note = case when p_status = 'skipped' then p_skip_note else null end,
        points_awarded = v_points,
        updated_at = now()
    where daily_log_id = v_log.id and habit_key = p_habit_key
    returning * into v_entry;

  if p_habit_key = 'training' then
    select * into v_rot from public.split_rotation_state where user_id = v_uid;

    if p_status = 'done' then
      if v_rot.last_completed_date = p_date then
        v_current_split := v_rot.last_completed_split;
      else
        v_current_split := public.next_split_day(v_rot.last_completed_split);
      end if;

      update public.split_rotation_state
        set last_completed_split = v_current_split, last_completed_date = p_date
        where user_id = v_uid;
    elsif v_rot.last_completed_date = p_date then
      update public.split_rotation_state
        set last_completed_split = null, last_completed_date = null
        where user_id = v_uid;
    end if;
  end if;

  return v_entry;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. Protein-Habit automatisch synchronisieren
-- ----------------------------------------------------------------------------

create or replace function public.sync_protein_habit(p_user_id uuid, p_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_log public.daily_logs;
  v_goal integer;
  v_total integer;
  v_def public.habit_definitions;
  v_entry public.habit_entries;
  v_new_status text;
  v_new_points integer;
begin
  select protein_goal_g into v_goal from public.settings where user_id = p_user_id;
  if v_goal is null then
    return;
  end if;

  select * into v_def from public.habit_definitions
    where user_id = p_user_id and key = 'protein' and active = true;
  if not found then
    return;
  end if;

  insert into public.daily_logs (user_id, log_date)
  values (p_user_id, p_date)
  on conflict (user_id, log_date) do nothing;

  select * into v_log from public.daily_logs where user_id = p_user_id and log_date = p_date;
  if v_log.locked then
    return;
  end if;

  insert into public.habit_entries (user_id, daily_log_id, habit_key, status, points_awarded)
  values (p_user_id, v_log.id, 'protein', 'missed', 0)
  on conflict (daily_log_id, habit_key) do nothing;

  select * into v_entry from public.habit_entries
    where daily_log_id = v_log.id and habit_key = 'protein';

  if v_entry.status = 'skipped' then
    return;
  end if;

  select coalesce(sum(grams), 0) into v_total
  from public.supplement_logs
  where user_id = p_user_id and log_date = p_date and type <> 'creatine';

  if v_total >= v_goal then
    v_new_status := 'done';
    v_new_points := v_def.points;
  else
    v_new_status := 'missed';
    v_new_points := 0;
  end if;

  if v_new_status is distinct from v_entry.status or v_new_points is distinct from v_entry.points_awarded then
    update public.habit_entries
      set status = v_new_status, points_awarded = v_new_points, updated_at = now()
      where id = v_entry.id;
  end if;
end;
$$;

create or replace function public.trg_sync_protein_on_supplement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_protein_habit(old.user_id, old.log_date);
    return old;
  else
    perform public.sync_protein_habit(new.user_id, new.log_date);
    return new;
  end if;
end;
$$;

drop trigger if exists supplement_logs_sync_protein on public.supplement_logs;
create trigger supplement_logs_sync_protein
  after insert or update or delete on public.supplement_logs
  for each row execute function public.trg_sync_protein_on_supplement();

create or replace function public.trg_sync_protein_on_goal_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.protein_goal_g is distinct from old.protein_goal_g then
    perform public.sync_protein_habit(new.user_id, (now() at time zone 'Europe/Berlin')::date);
  end if;
  return new;
end;
$$;

drop trigger if exists settings_sync_protein_on_goal_change on public.settings;
create trigger settings_sync_protein_on_goal_change
  after update on public.settings
  for each row execute function public.trg_sync_protein_on_goal_change();

create or replace function public.trg_sync_protein_on_points_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.key = 'protein' and new.points is distinct from old.points then
    perform public.sync_protein_habit(new.user_id, (now() at time zone 'Europe/Berlin')::date);
  end if;
  return new;
end;
$$;

drop trigger if exists habit_definitions_sync_protein on public.habit_definitions;
create trigger habit_definitions_sync_protein
  after update on public.habit_definitions
  for each row execute function public.trg_sync_protein_on_points_change();

-- Bestehende, heutige "protein"-Einträge einmalig neu berechnen (falls schon Supplement-Logs
-- für heute existieren, bevor dieser Trigger aktiv war).
do $$
declare
  r record;
begin
  for r in select distinct user_id from public.settings loop
    perform public.sync_protein_habit(r.user_id, (now() at time zone 'Europe/Berlin')::date);
  end loop;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. Automatischer Gamble-Ersparnis-Abzug alle 2 Tage
-- ----------------------------------------------------------------------------

create or replace function public.auto_apply_gamble_savings()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_today date := (now() at time zone 'Europe/Berlin')::date;
  v_latest_balance numeric;
begin
  for r in
    select s.user_id, s.gamble_savings_amount, s.last_auto_saving_date
    from public.settings s
    where s.gamble_savings_amount > 0
      and (s.last_auto_saving_date is null or v_today - s.last_auto_saving_date >= 2)
  loop
    select amount into v_latest_balance
    from public.balance_entries
    where user_id = r.user_id
    order by entry_date desc, created_at desc
    limit 1;

    if v_latest_balance is not null and v_latest_balance > r.gamble_savings_amount then
      insert into public.savings_entries (user_id, amount, entry_date, note)
      values (r.user_id, r.gamble_savings_amount, v_today, 'Automatisch (kein Gamblen)');

      update public.settings
        set last_auto_saving_date = v_today
        where user_id = r.user_id;
    end if;
  end loop;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. Grants
-- ----------------------------------------------------------------------------

revoke execute on function public.sync_protein_habit(uuid, date) from public, anon, authenticated;
revoke execute on function public.trg_sync_protein_on_supplement() from public, anon, authenticated;
revoke execute on function public.trg_sync_protein_on_goal_change() from public, anon, authenticated;
revoke execute on function public.trg_sync_protein_on_points_change() from public, anon, authenticated;
revoke execute on function public.auto_apply_gamble_savings() from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. pg_cron: Gamble-Ersparnis alle 15 Minuten prüfen (löst selbst nur alle 2 Tage aus)
-- ----------------------------------------------------------------------------

select cron.schedule(
  'auto-apply-gamble-savings',
  '*/15 * * * *',
  $$select public.auto_apply_gamble_savings();$$
);
