-- ============================================================================
-- Disziplin-Kontrollpanel — Supabase Datenbankschema
-- Einmal komplett im Supabase SQL-Editor ausführen (Projekt > SQL Editor > New query).
-- Voraussetzung: Extension "pg_cron" muss unter Database > Extensions aktiviert sein
-- (das untenstehende `create extension if not exists pg_cron` versucht es zusätzlich).
-- ============================================================================

create extension if not exists pgcrypto;
create extension if not exists pg_cron with schema extensions;

-- ============================================================================
-- TABELLEN
-- ============================================================================

create table public.habit_definitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  label text not null,
  points integer not null default 0,
  is_core boolean not null default false,
  is_bonus boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, key)
);

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  sleep_start timestamptz,
  wake_time timestamptz,
  locked boolean not null default false,
  locked_at timestamptz,
  streak_after integer,
  points_after integer,
  streak_before integer,
  points_before integer,
  is_rest_day boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  habit_key text not null,
  status text not null default 'missed' check (status in ('done', 'skipped', 'missed')),
  skip_note text,
  points_awarded integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (daily_log_id, habit_key)
);

create table public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  total_points integer not null default 0,
  updated_at timestamptz not null default now()
);

-- weekday: 0 = Sonntag ... 6 = Samstag (entspricht JS Date.getDay())
create table public.weekday_schedule (
  user_id uuid not null references auth.users(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  first_lesson_time time,
  commute_minutes integer not null default 30,
  primary key (user_id, weekday)
);

create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  protein_goal_g integer not null default 140,
  wake_buffer_minutes integer not null default 45,
  target_sleep_hours numeric(3, 1) not null default 7.5,
  todo_bonus_points integer not null default 15,
  gamble_savings_amount numeric(10, 2) not null default 45,
  last_auto_saving_date date,
  unlock_pin text not null default '1234' check (unlock_pin ~ '^[0-9]{4}$'),
  updated_at timestamptz not null default now()
);

-- globale Referenztabelle (kein user_id) — der fixe Push/Pull/Legs-Plan
create table public.exercise_definitions (
  id uuid primary key default gen_random_uuid(),
  split_day text not null check (split_day in ('push', 'pull', 'legs')),
  name text not null,
  sets_target integer not null,
  reps_target text not null,
  sort_order integer not null default 0
);

create table public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercise_definitions(id) on delete cascade,
  log_date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, exercise_id, log_date)
);

-- user_id ist hier denormalisiert (statt nur über exercise_log_id abgeleitet), damit RLS
-- und der Supabase-Realtime-Filter (unterstützt nur Gleichheits-Filter auf Spalten der
-- eigenen Tabelle, keine Subqueries) einfach und performant auf user_id filtern können.
-- Wird per Trigger automatisch aus exercise_logs übernommen, siehe set_exercise_set_user_id().
create table public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_log_id uuid not null references public.exercise_logs(id) on delete cascade,
  set_number integer not null,
  weight_kg numeric(5, 2),
  reps integer,
  unique (exercise_log_id, set_number)
);

create table public.split_rotation_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_completed_split text check (last_completed_split in ('push', 'pull', 'legs')),
  last_completed_date date
);

create table public.supplement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  type text not null check (type in ('shake', 'riegel', 'custom', 'creatine')),
  grams integer,
  created_at timestamptz not null default now()
);

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date date,
  status text not null default 'open' check (status in ('open', 'done')),
  completed_at timestamptz,
  bonus_awarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.savings_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10, 2) not null,
  entry_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table public.balance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10, 2) not null,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_streak integer not null,
  achieved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- INDIZES
-- ============================================================================

create index daily_logs_user_date_idx on public.daily_logs (user_id, log_date);
create index habit_entries_user_idx on public.habit_entries (user_id, daily_log_id);
create index exercise_logs_user_date_idx on public.exercise_logs (user_id, log_date);
create index exercise_sets_log_idx on public.exercise_sets (exercise_log_id);
create index exercise_sets_user_idx on public.exercise_sets (user_id);
create index supplement_logs_user_date_idx on public.supplement_logs (user_id, log_date);
create index todos_user_status_idx on public.todos (user_id, status);
create index savings_entries_user_date_idx on public.savings_entries (user_id, entry_date);
create index balance_entries_user_date_idx on public.balance_entries (user_id, entry_date);
create index milestones_user_idx on public.milestones (user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.habit_definitions enable row level security;
alter table public.daily_logs enable row level security;
alter table public.habit_entries enable row level security;
alter table public.user_stats enable row level security;
alter table public.weekday_schedule enable row level security;
alter table public.settings enable row level security;
alter table public.exercise_definitions enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.exercise_sets enable row level security;
alter table public.split_rotation_state enable row level security;
alter table public.supplement_logs enable row level security;
alter table public.todos enable row level security;
alter table public.savings_entries enable row level security;
alter table public.balance_entries enable row level security;
alter table public.milestones enable row level security;

create policy "own rows" on public.habit_definitions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.daily_logs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.habit_entries for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.user_stats for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.weekday_schedule for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.settings for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.exercise_logs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.exercise_sets for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.split_rotation_state for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.supplement_logs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.todos for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.savings_entries for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.balance_entries for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.milestones for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- exercise_definitions: globale, feste Trainingsplan-Referenz — nur lesbar
create policy "read only" on public.exercise_definitions for select
  using (auth.role() = 'authenticated');

-- ============================================================================
-- FUNKTIONEN
-- ============================================================================

create or replace function public.next_split_day(p_split text)
returns text
language sql
immutable
as $$
  select case p_split
    when 'push' then 'pull'
    when 'pull' then 'legs'
    when 'legs' then 'push'
    else 'push'
  end;
$$;

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

-- Setzt den aktuell angezeigten (noch nicht abgeschlossenen) Split-Tag manuell auf p_target.
-- Merkt sich den Stand wie ein "noch nicht heute trainiert"-Zustand, d.h. last_completed_date
-- wird geleert — das nächste Abhaken von "Training absolviert" rotiert von p_target aus weiter.
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

-- Legt für neu registrierte User Standarddaten an (Habits, Settings, Stundenplan-Gerüst).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_stats (user_id) values (new.id);
  insert into public.settings (user_id) values (new.id);
  insert into public.split_rotation_state (user_id) values (new.id);

  insert into public.habit_definitions (user_id, key, label, points, is_core, is_bonus, sort_order) values
    (new.id, 'training', 'Training absolviert', 20, true, false, 1),
    (new.id, 'protein', 'Proteinziel erreicht', 15, true, false, 2),
    (new.id, 'sleep_early', 'Früh schlafen gegangen', 15, true, false, 3),
    (new.id, 'no_gambling', 'Daily Check', 20, true, false, 4),
    (new.id, 'cold_shower', 'Kalt geduscht', 10, false, true, 5),
    (new.id, 'business_outreach', 'Akquise-Nachricht verschickt', 10, false, false, 6);

  insert into public.weekday_schedule (user_id, weekday, first_lesson_time, commute_minutes)
  select new.id, d, null, 30 from generate_series(0, 6) as d;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Hält user_stats.total_points synchron zu habit_entries.points_awarded.
create or replace function public.sync_total_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delta integer;
begin
  if tg_op = 'INSERT' then
    v_delta := new.points_awarded;
  elsif tg_op = 'UPDATE' then
    v_delta := new.points_awarded - old.points_awarded;
  elsif tg_op = 'DELETE' then
    v_delta := -old.points_awarded;
  end if;

  if v_delta is distinct from 0 then
    update public.user_stats
      set total_points = total_points + v_delta,
          updated_at = now()
      where user_id = coalesce(new.user_id, old.user_id);
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists habit_entries_sync_points on public.habit_entries;
create trigger habit_entries_sync_points
  after insert or update or delete on public.habit_entries
  for each row execute function public.sync_total_points();

-- Stellt sicher, dass für ein Datum ein daily_log + alle aktiven habit_entries existieren.
create or replace function public.ensure_daily_log(p_date date)
returns public.daily_logs
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
  v_log public.daily_logs;
begin
  insert into public.daily_logs (user_id, log_date)
  values (v_uid, p_date)
  on conflict (user_id, log_date) do nothing;

  select * into v_log from public.daily_logs where user_id = v_uid and log_date = p_date;

  insert into public.habit_entries (user_id, daily_log_id, habit_key, status, points_awarded)
  select v_uid, v_log.id, hd.key, 'missed', 0
  from public.habit_definitions hd
  where hd.user_id = v_uid and hd.active = true
  on conflict (daily_log_id, habit_key) do nothing;

  return v_log;
end;
$$;

-- Setzt den Status (done/skipped/missed) eines Habits für ein Datum, inkl. Punkteberechnung
-- und Push/Pull/Legs-Rotation, wenn es sich um das "training"-Habit handelt.
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
      -- Training am selben Tag wieder abgewählt: Rotation-Vorrücken rückgängig machen.
      update public.split_rotation_state
        set last_completed_split = null, last_completed_date = null
        where user_id = v_uid;
    end if;
  end if;

  return v_entry;
end;
$$;

-- Schließt einen Tag für einen konkreten User ab (SECURITY DEFINER, nur intern nutzbar,
-- siehe REVOKE weiter unten). Wertet Kern-Habits aus und aktualisiert die Streak.
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

-- Entsperrt einen abgeschlossenen Tag wieder, wenn die richtige PIN eingegeben wird — macht
-- dabei den Streak-Effekt des Abschlusses rückgängig (Punkte bleiben unverändert, da sie
-- direkt über die habit_entries synchron gehalten werden, nicht über diesen Snapshot).
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

-- Markiert/entfernt einen Rest Day für ein Datum. Aktiviert: setzt das "training"-Habit auf
-- 'skipped' (neutral, keine Punkte, keine Streak-Unterbrechung) mit Notiz "Rest Day" — außer
-- es wurde für den Tag schon "done" gesetzt, das bleibt unangetastet. Deaktiviert: macht die
-- Rest-Day-Markierung nur rückgängig, wenn sie noch unverändert (skip_note = 'Rest Day') ist,
-- damit ein zwischenzeitlich manuell gesetzter Skip nicht überschrieben wird.
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

-- Öffentliche RPC für den "Tag abschließen"-Button: schließt immer den eigenen Tag.
-- SECURITY DEFINER, damit sie intern close_day_for_user aufrufen darf (das bewusst per
-- REVOKE vor direkten Aufrufen mit fremder user_id geschützt ist); auth.uid() bindet den
-- Aufruf trotzdem zwingend an den eigenen, eingeloggten User.
create or replace function public.close_day(p_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  perform public.ensure_daily_log(p_date);
  perform public.close_day_for_user(v_uid, p_date);
end;
$$;

-- Wird alle 15 Minuten per pg_cron aufgerufen (siehe unten) und schließt automatisch
-- abgelaufene, nicht manuell gesperrte Tage — Zeitzonen-/DST-sicher via Europe/Berlin.
create or replace function public.auto_close_stale_days()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_today_berlin date := (now() at time zone 'Europe/Berlin')::date;
begin
  for r in
    select user_id, log_date from public.daily_logs
    where locked = false and log_date < v_today_berlin
  loop
    perform public.close_day_for_user(r.user_id, r.log_date);
  end loop;
end;
$$;

-- To-do als erledigt markieren; vergibt Bonuspunkte, wenn vor der Frist erledigt.
create or replace function public.complete_todo(p_id uuid)
returns public.todos
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
  v_todo public.todos;
  v_bonus integer;
  v_award boolean := false;
begin
  select * into v_todo from public.todos where id = p_id and user_id = v_uid;
  if not found then
    raise exception 'todo not found';
  end if;

  if v_todo.status = 'done' then
    return v_todo;
  end if;

  if v_todo.due_date is not null and current_date <= v_todo.due_date then
    v_award := true;
  end if;

  update public.todos
    set status = 'done', completed_at = now(), bonus_awarded = v_award
    where id = p_id
    returning * into v_todo;

  if v_award then
    select todo_bonus_points into v_bonus from public.settings where user_id = v_uid;
    update public.user_stats
      set total_points = total_points + coalesce(v_bonus, 0), updated_at = now()
      where user_id = v_uid;
  end if;

  return v_todo;
end;
$$;

-- Macht "erledigt" wieder rückgängig; zieht ggf. vergebene Bonuspunkte wieder ab.
create or replace function public.reopen_todo(p_id uuid)
returns public.todos
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
  v_todo public.todos;
  v_bonus integer;
begin
  select * into v_todo from public.todos where id = p_id and user_id = v_uid;
  if not found then
    raise exception 'todo not found';
  end if;

  if v_todo.bonus_awarded then
    select todo_bonus_points into v_bonus from public.settings where user_id = v_uid;
    update public.user_stats
      set total_points = total_points - coalesce(v_bonus, 0), updated_at = now()
      where user_id = v_uid;
  end if;

  update public.todos
    set status = 'open', completed_at = null, bonus_awarded = false
    where id = p_id
    returning * into v_todo;

  return v_todo;
end;
$$;

-- Erzwingt, dass exercise_sets.user_id immer aus dem übergeordneten exercise_log übernommen
-- wird (Client-Wert wird ignoriert) — verhindert Inkonsistenzen zwischen beiden Spalten.
create or replace function public.set_exercise_set_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select user_id into new.user_id from public.exercise_logs where id = new.exercise_log_id;
  return new;
end;
$$;

drop trigger if exists exercise_sets_set_user_id on public.exercise_sets;
create trigger exercise_sets_set_user_id
  before insert on public.exercise_sets
  for each row execute function public.set_exercise_set_user_id();

-- Berechnet den "protein"-Habit-Status neu (done, sobald die Tagessumme der Supplement-Logs
-- das Protein-Ziel erreicht) und respektiert dabei einen manuell gesetzten Skip sowie
-- gesperrte (abgeschlossene) Tage. Wird per Trigger aufgerufen, nicht direkt von Clients.
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

-- Bei Änderung des Protein-Ziels (Einstellungen) den heutigen Status sofort neu berechnen.
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

-- Bei Änderung des Punktwerts des "protein"-Habits den heutigen Status neu berechnen.
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

-- Trägt alle 2 Tage automatisch den konfigurierten Betrag als Ersparnis ein — aber nur,
-- wenn der zuletzt eingetragene Kontostand größer als der Betrag ist. Wird per pg_cron
-- aufgerufen (siehe unten), Zeitzone Europe/Berlin, DST-sicher.
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

-- ============================================================================
-- GRANTS
-- ============================================================================

revoke execute on function public.close_day_for_user(uuid, date) from public, anon, authenticated;
revoke execute on function public.auto_close_stale_days() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.sync_total_points() from public, anon, authenticated;
revoke execute on function public.set_exercise_set_user_id() from public, anon, authenticated;
revoke execute on function public.sync_protein_habit(uuid, date) from public, anon, authenticated;
revoke execute on function public.trg_sync_protein_on_supplement() from public, anon, authenticated;
revoke execute on function public.trg_sync_protein_on_goal_change() from public, anon, authenticated;
revoke execute on function public.trg_sync_protein_on_points_change() from public, anon, authenticated;
revoke execute on function public.auto_apply_gamble_savings() from public, anon, authenticated;

grant execute on function public.ensure_daily_log(date) to authenticated;
grant execute on function public.set_habit_status(date, text, text, text) to authenticated;
grant execute on function public.close_day(date) to authenticated;
grant execute on function public.complete_todo(uuid) to authenticated;
grant execute on function public.reopen_todo(uuid) to authenticated;
grant execute on function public.next_split_day(text) to authenticated;
grant execute on function public.unlock_day(date, text) to authenticated;
grant execute on function public.set_rest_day(date, boolean) to authenticated;
grant execute on function public.set_split_day(text) to authenticated;
grant execute on function public.prev_split_day(text) to authenticated;

-- ============================================================================
-- REALTIME
-- ============================================================================

alter publication supabase_realtime add table
  public.daily_logs,
  public.habit_entries,
  public.habit_definitions,
  public.user_stats,
  public.weekday_schedule,
  public.settings,
  public.exercise_logs,
  public.exercise_sets,
  public.split_rotation_state,
  public.supplement_logs,
  public.todos,
  public.savings_entries,
  public.balance_entries,
  public.milestones;

-- ============================================================================
-- PG_CRON: automatischer Mitternachts-Abschluss (alle 15 Minuten geprüft, Europe/Berlin)
-- ============================================================================

select cron.schedule(
  'auto-close-stale-days',
  '*/15 * * * *',
  $$select public.auto_close_stale_days();$$
);

select cron.schedule(
  'auto-apply-gamble-savings',
  '*/15 * * * *',
  $$select public.auto_apply_gamble_savings();$$
);

-- ============================================================================
-- SEED: fixer Push/Pull/Legs-Trainingsplan (global, nicht pro User)
-- ============================================================================

insert into public.exercise_definitions (split_day, name, sets_target, reps_target, sort_order) values
  ('push', 'Bankdrücken Langhantel', 4, '6-8', 1),
  ('push', 'Schrägbankdrücken Kurzhantel', 3, '8-10', 2),
  ('push', 'Schulterdrücken Langhantel/Maschine', 3, '8-10', 3),
  ('push', 'Seitheben Kurzhantel', 3, '12-15', 4),
  ('push', 'Dips oder Trizeps-Pushdown Kabel', 3, '10-12', 5),
  ('push', 'Trizeps-Overhead-Extension', 3, '12-15', 6),

  ('pull', 'Klimmzüge (oder Latzug)', 4, '6-10', 1),
  ('pull', 'Langhantelrudern', 4, '8-10', 2),
  ('pull', 'Kabelrudern eng', 3, '10-12', 3),
  ('pull', 'Face Pulls', 3, '15', 4),
  ('pull', 'Bizeps-Curls Langhantel', 3, '8-12', 5),
  ('pull', 'Hammer-Curls Kurzhantel', 3, '12-15', 6),

  ('legs', 'Kniebeugen Langhantel', 4, '6-8', 1),
  ('legs', 'Rumänisches Kreuzheben', 3, '8-10', 2),
  ('legs', 'Beinpresse', 3, '10-12', 3),
  ('legs', 'Beinbeuger Maschine', 3, '12-15', 4),
  ('legs', 'Wadenheben', 4, '15-20', 5);
