import type { HabitDefinition, HabitEntry } from "@/lib/types";

/** Kern-Habits, die für den heutigen Tag weder erledigt noch geskippt sind. */
export function missingCoreHabits(
  definitions: HabitDefinition[],
  entries: HabitEntry[],
): HabitDefinition[] {
  return definitions
    .filter((d) => d.is_core && d.active)
    .filter((d) => {
      const entry = entries.find((e) => e.habit_key === d.key);
      return !entry || entry.status === "missed";
    });
}
