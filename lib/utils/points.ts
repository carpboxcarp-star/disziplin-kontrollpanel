import type { HabitEntry } from "@/lib/types";

export function sumPoints(entries: HabitEntry[]): number {
  return entries.reduce((sum, e) => sum + (e.points_awarded ?? 0), 0);
}
