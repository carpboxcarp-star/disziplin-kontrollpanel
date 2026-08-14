import { createClient } from "@/lib/supabase/client";

export async function addSaving(userId: string, amount: number, entryDate: string, note: string | null) {
  const supabase = createClient();
  return supabase.from("savings_entries").insert({ user_id: userId, amount, entry_date: entryDate, note });
}

export async function deleteSaving(id: string) {
  const supabase = createClient();
  return supabase.from("savings_entries").delete().eq("id", id);
}

export async function addBalance(userId: string, amount: number, entryDate: string) {
  const supabase = createClient();
  return supabase.from("balance_entries").insert({ user_id: userId, amount, entry_date: entryDate });
}

export async function deleteBalance(id: string) {
  const supabase = createClient();
  return supabase.from("balance_entries").delete().eq("id", id);
}
