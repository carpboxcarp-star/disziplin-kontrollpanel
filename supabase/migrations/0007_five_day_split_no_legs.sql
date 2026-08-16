-- ============================================================================
-- Migration 0007: 5-Tage-Trainingsplan ohne Beine (ersetzt Push/Pull/Legs)
--
-- ACHTUNG — DATENVERLUST: Dieses Skript löscht alle bestehenden Zeilen in
-- exercise_definitions und ersetzt sie durch den neuen 5-Tage-Plan. Da
-- exercise_logs/exercise_sets per FOREIGN KEY ... ON DELETE CASCADE an
-- exercise_definitions hängen, werden dabei auch alle bisher zu den alten
-- Push/Pull/Legs-Übungen geloggten Sätze/Gewichte UNWIDERRUFLICH gelöscht.
-- Falls du diese Historie behalten willst, vorher exportieren (Table Editor
-- → exercise_logs / exercise_sets → Export).
--
-- Für ein bereits eingerichtetes Projekt: einmal komplett im Supabase SQL-Editor
-- ausführen.
-- ============================================================================

-- 1. Bestehende Rotation-Stände zurücksetzen, BEVOR der neue CHECK-Constraint kommt
--    (alte Werte wie 'push' wären sonst ungültig).
update public.split_rotation_state set last_completed_split = null, last_completed_date = null;

-- 2. Alte Constraints nur DROPPEN (noch nicht neu anlegen) — sonst validiert Postgres
--    "add constraint" sofort gegen die zu diesem Zeitpunkt noch vorhandenen alten
--    Push/Pull/Legs-Zeilen in exercise_definitions und schlägt fehl.
alter table public.exercise_definitions drop constraint if exists exercise_definitions_split_day_check;
alter table public.split_rotation_state drop constraint if exists split_rotation_state_last_completed_split_check;

-- 3. Alten Plan löschen (kaskadiert zu exercise_logs/exercise_sets, siehe Warnung oben)
--    und den neuen 5-Tage-Plan einfügen — die Tabelle enthält danach nur noch gültige Werte.
delete from public.exercise_definitions;

insert into public.exercise_definitions (split_day, name, sets_target, reps_target, sort_order) values
  ('day1', 'Bankdrücken Langhantel', 4, '6-8', 1),
  ('day1', 'Schrägbankdrücken Kurzhantel', 3, '8-10', 2),
  ('day1', 'Dips', 3, '10-12', 3),
  ('day1', 'Trizeps-Pushdown Kabel', 3, '10-12', 4),
  ('day1', 'Trizeps-Overhead-Extension', 3, '12-15', 5),

  ('day2', 'Klimmzüge (oder Latzug)', 4, '6-10', 1),
  ('day2', 'Langhantelrudern', 4, '8-10', 2),
  ('day2', 'Kabelrudern', 3, '10-12', 3),
  ('day2', 'Bizeps-Curl Langhantel', 3, '8-12', 4),
  ('day2', 'Hammer-Curls', 3, '12-15', 5),

  ('day3', 'Schulterdrücken Langhantel', 4, '6-8', 1),
  ('day3', 'Seitheben Kurzhantel', 3, '12-15', 2),
  ('day3', 'Frontheben', 3, '12-15', 3),
  ('day3', 'Face Pulls', 3, '15', 4),
  ('day3', 'Nackentraining Maschine', 3, '15', 5),

  ('day4', 'Schrägbankdrücken Langhantel', 4, '6-8', 1),
  ('day4', 'Butterfly Maschine', 3, '12-15', 2),
  ('day4', 'Kabelcrossover', 3, '12-15', 3),
  ('day4', 'Konzentrations-Curls', 3, '12-15', 4),
  ('day4', 'Cable-Curls', 3, '12-15', 5),

  ('day5', 'Kreuzheben', 4, '5-6', 1),
  ('day5', 'T-Bar-Rudern', 3, '8-10', 2),
  ('day5', 'Latziehen eng', 3, '10-12', 3),
  ('day5', 'Trizeps-Dips', 3, '10-12', 4),
  ('day5', 'Skull-Crushers', 3, '10-12', 5);

-- 4. Jetzt die neuen Constraints anlegen — die Tabellen enthalten nur noch gültige
--    ('day1'..'day5' bzw. null) Werte, die Validierung passt also durch.
alter table public.exercise_definitions add constraint exercise_definitions_split_day_check
  check (split_day in ('day1', 'day2', 'day3', 'day4', 'day5'));

alter table public.split_rotation_state add constraint split_rotation_state_last_completed_split_check
  check (last_completed_split in ('day1', 'day2', 'day3', 'day4', 'day5'));

-- 5. Rotationslogik auf den 5-Tage-Zyklus umstellen.
create or replace function public.next_split_day(p_split text)
returns text
language sql
immutable
as $$
  select case p_split
    when 'day1' then 'day2'
    when 'day2' then 'day3'
    when 'day3' then 'day4'
    when 'day4' then 'day5'
    when 'day5' then 'day1'
    else 'day1'
  end;
$$;

create or replace function public.prev_split_day(p_split text)
returns text
language sql
immutable
as $$
  select case p_split
    when 'day1' then 'day5'
    when 'day2' then 'day1'
    when 'day3' then 'day2'
    when 'day4' then 'day3'
    when 'day5' then 'day4'
    else 'day5'
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
  if p_target not in ('day1', 'day2', 'day3', 'day4', 'day5') then
    raise exception 'invalid split %', p_target;
  end if;

  update public.split_rotation_state
    set last_completed_split = public.prev_split_day(p_target),
        last_completed_date = null
    where user_id = v_uid;
end;
$$;
