import { createClient } from "@/lib/supabase/client";

export async function addMilestone(userId: string, name: string, targetStreak: number) {
  const supabase = createClient();
  return supabase.from("milestones").insert({ user_id: userId, name, target_streak: targetStreak });
}

export async function deleteMilestone(id: string) {
  const supabase = createClient();
  return supabase.from("milestones").delete().eq("id", id);
}
