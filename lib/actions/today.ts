import { createClient } from "@/lib/supabase/client";
import { todayStr } from "@/lib/utils/date";
import type { HabitStatus } from "@/lib/types";

export async function ensureDailyLog(date: string) {
  const supabase = createClient();
  return supabase.rpc("ensure_daily_log", { p_date: date });
}

export async function setHabitStatus(
  date: string,
  habitKey: string,
  status: HabitStatus,
  skipNote?: string,
) {
  const supabase = createClient();
  return supabase.rpc("set_habit_status", {
    p_date: date,
    p_habit_key: habitKey,
    p_status: status,
    p_skip_note: skipNote ?? null,
  });
}

export async function setSleepTimestamp(dailyLogId: string, field: "sleep_start" | "wake_time") {
  const supabase = createClient();
  return supabase
    .from("daily_logs")
    .update({ [field]: new Date().toISOString() })
    .eq("id", dailyLogId);
}

export async function closeDay(date: string) {
  const supabase = createClient();
  return supabase.rpc("close_day", { p_date: date });
}

export async function unlockDay(date: string, pin: string) {
  const supabase = createClient();
  return supabase.rpc("unlock_day", { p_date: date, p_pin: pin });
}

/** Schreibt wake_time für "heute" — verwendet vom Standby-Aufwachen-Button, unabhängig
 * davon, welcher Tag zum Zeitpunkt des Einschlafens aktuell war. */
export async function wakeUp() {
  const date = todayStr();
  const { data: log, error } = await ensureDailyLog(date);
  if (error || !log) return { error };
  return setSleepTimestamp(log.id, "wake_time");
}
