import { createClient } from "@/lib/supabase/client";
import type { ExerciseLog, SupplementType } from "@/lib/types";

export async function ensureExerciseLog(
  userId: string,
  exerciseId: string,
  date: string,
): Promise<ExerciseLog> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("exercise_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .eq("log_date", date)
    .maybeSingle();

  if (existing) return existing as ExerciseLog;

  const { data, error } = await supabase
    .from("exercise_logs")
    .insert({ user_id: userId, exercise_id: exerciseId, log_date: date })
    .select()
    .single();

  if (error) throw error;
  return data as ExerciseLog;
}

export async function setExerciseCompleted(logId: string, completed: boolean) {
  const supabase = createClient();
  return supabase.from("exercise_logs").update({ completed }).eq("id", logId);
}

export async function upsertExerciseSet(
  exerciseLogId: string,
  setNumber: number,
  weightKg: number | null,
  reps: number | null,
) {
  const supabase = createClient();
  return supabase
    .from("exercise_sets")
    .upsert(
      { exercise_log_id: exerciseLogId, set_number: setNumber, weight_kg: weightKg, reps },
      { onConflict: "exercise_log_id,set_number" },
    );
}

export async function logSupplement(
  userId: string,
  date: string,
  type: SupplementType,
  grams: number | null,
) {
  const supabase = createClient();
  return supabase.from("supplement_logs").insert({ user_id: userId, log_date: date, type, grams });
}

export async function deleteSupplementLog(id: string) {
  const supabase = createClient();
  return supabase.from("supplement_logs").delete().eq("id", id);
}

export async function setRestDay(date: string, isRestDay: boolean) {
  const supabase = createClient();
  return supabase.rpc("set_rest_day", { p_date: date, p_is_rest_day: isRestDay });
}
