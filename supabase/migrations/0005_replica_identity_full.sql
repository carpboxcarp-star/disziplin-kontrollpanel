-- ============================================================================
-- Migration 0005: REPLICA IDENTITY FULL für Tabellen mit client-seitigem DELETE
--
-- Behebt: Lösch-Buttons (Protein-Einträge, To-dos, Ersparnisse, Kontostand,
-- Meilensteine) löschten die Zeile zwar korrekt in der Datenbank, die UI zeigte
-- sie aber weiter an, da Postgres bei DELETE standardmäßig nur den Primärschlüssel
-- repliziert — der Supabase-Realtime-Filter "user_id=eq.<uid>" konnte dadurch nicht
-- matchen und der Client erhielt nie ein Update.
--
-- Für ein bereits eingerichtetes Projekt: einmal komplett im Supabase SQL-Editor
-- ausführen. Idempotent (sicher erneut ausführbar).
-- ============================================================================

alter table public.supplement_logs replica identity full;
alter table public.todos replica identity full;
alter table public.savings_entries replica identity full;
alter table public.balance_entries replica identity full;
alter table public.milestones replica identity full;
alter table public.exercise_sets replica identity full;
