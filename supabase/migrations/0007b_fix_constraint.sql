-- ============================================================================
-- Migration 0007b: Fix für 0007 — Constraint-Name wurde falsch geraten
--
-- 0007 ist beim ADD CONSTRAINT gescheitert und wurde deshalb komplett
-- zurückgerollt (SQL-Editor führt ein Skript als eine Transaktion aus) —
-- weder die exercise_definitions-Daten noch die split_rotation_state-Constraint
-- noch next_split_day/prev_split_day/set_split_day wurden bislang tatsächlich
-- geändert. Diese Datei ersetzt 0007 komplett und findet den echten
-- Constraint-Namen zur Laufzeit über pg_constraint, statt ihn zu raten.
--
-- Nur diese Datei ausführen (0007 NICHT zusätzlich erneut ausführen).
--
-- ACHTUNG — DATENVERLUST: löscht alle Zeilen in exercise_definitions und damit
-- kaskadierend alle bisher geloggten Sätze/Gewichte (exercise_logs/exercise_sets).
-- ============================================================================

-- 1. Alle bestehenden CHECK-Constraints auf den beiden betroffenen Tabellen droppen —
--    unabhängig davon, wie sie tatsächlich heißen.
do $$
declare
  r record;
begin
  for r in
    select con.conname, rel.relname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname in ('exercise_definitions', 'split_rotation_state')
      and con.contype = 'c'
  loop
    execute format('alter table public.%I drop constraint %I', r.relname, r.conname);
  end loop;
end;
$$;

-- 2. Rotation-Stände zurücksetzen (alte Werte wie 'push' wären für die neue
--    Constraint ungültig).
update public.split_rotation_state set last_completed_split = null, last_completed_date = null;

-- 3. Alten Plan löschen und den neuen 5-Tage-Plan einfügen.
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

-- 4. Neue Constraints anlegen — Tabellen enthalten jetzt nur noch gültige Werte.
alter table public.exercise_definitions add constraint exercise_definitions_split_day_check
  check (split_day in ('day1', 'day2', 'day3', 'day4', 'day5'));

alter table public.split_rotation_state add constraint split_rotation_state_last_completed_split_check
  check (last_completed_split in ('day1', 'day2', 'day3', 'day4', 'day5'));

-- 5. Rotationslogik auf den 5-Tage-Zyklus umstellen (in 0007 enthalten, aber wegen
--    des Rollbacks nie tatsächlich angewendet — hier zur Sicherheit erneut).
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
