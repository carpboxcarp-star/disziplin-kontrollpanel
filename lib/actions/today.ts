import { createClient } from "@/lib/supabase/client";
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
