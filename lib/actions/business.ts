import { createClient } from "@/lib/supabase/client";

export async function addTodo(userId: string, title: string, dueDate: string | null) {
  const supabase = createClient();
  return supabase.from("todos").insert({ user_id: userId, title, due_date: dueDate });
}

export async function completeTodo(id: string) {
  const supabase = createClient();
  return supabase.rpc("complete_todo", { p_id: id });
}

export async function reopenTodo(id: string) {
  const supabase = createClient();
  return supabase.rpc("reopen_todo", { p_id: id });
}

export async function deleteTodo(id: string) {
  const supabase = createClient();
  return supabase.from("todos").delete().eq("id", id);
}
