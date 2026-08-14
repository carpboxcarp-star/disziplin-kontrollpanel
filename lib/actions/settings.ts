import { createClient } from "@/lib/supabase/client";

export async function updateWeekdaySchedule(
  userId: string,
  weekday: number,
  firstLessonTime: string | null,
  commuteMinutes: number,
) {
  const supabase = createClient();
  return supabase
    .from("weekday_schedule")
    .upsert(
      { user_id: userId, weekday, first_lesson_time: firstLessonTime, commute_minutes: commuteMinutes },
      { onConflict: "user_id,weekday" },
    );
}

export async function updateSettings(
  userId: string,
  patch: Partial<{
    protein_goal_g: number;
    wake_buffer_minutes: number;
    target_sleep_hours: number;
    todo_bonus_points: number;
  }>,
) {
  const supabase = createClient();
  return supabase.from("settings").update(patch).eq("user_id", userId);
}

export async function updateHabitDefinition(
  id: string,
  patch: Partial<{ label: string; points: number; active: boolean }>,
) {
  const supabase = createClient();
  return supabase.from("habit_definitions").update(patch).eq("id", id);
}
