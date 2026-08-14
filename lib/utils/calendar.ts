import type { DailyLog, HabitDefinition, HabitEntry } from "@/lib/types";

export type DayStatus = "full" | "partial" | "missed" | "skipped" | "pending" | "future";

export interface DayInfo {
  date: string;
  status: DayStatus;
  note?: string;
}

export function computeDayStatus(
  date: string,
  today: string,
  dailyLogs: DailyLog[],
  habitEntries: HabitEntry[],
  habitDefinitions: HabitDefinition[],
): DayInfo {
  if (date > today) return { date, status: "future" };

  const log = dailyLogs.find((l) => l.log_date === date);
  const coreDefs = habitDefinitions.filter((d) => d.is_core);

  if (!log) {
    return date === today ? { date, status: "pending" } : { date, status: "missed" };
  }

  if (!log.locked) {
    return { date, status: "pending" };
  }

  const entries = habitEntries.filter((e) => e.daily_log_id === log.id);
  const coreEntries = coreDefs.map((d) => entries.find((e) => e.habit_key === d.key));

  const missedCount = coreEntries.filter((e) => !e || e.status === "missed").length;
  const skippedCount = coreEntries.filter((e) => e?.status === "skipped").length;

  const notes = entries.filter((e) => e.status === "skipped" && e.skip_note).map((e) => e.skip_note as string);
  const note = notes.length > 0 ? notes.join("; ") : undefined;

  if (missedCount > 0) return { date, status: "missed", note };
  if (skippedCount === coreDefs.length && coreDefs.length > 0) return { date, status: "skipped", note };
  if (skippedCount > 0) return { date, status: "partial", note };
  return { date, status: "full", note };
}

export const STATUS_COLOR: Record<DayStatus, string> = {
  full: "bg-status-full",
  partial: "bg-status-partial",
  missed: "bg-status-missed",
  skipped: "bg-status-skipped",
  pending: "bg-panel-raised border border-border",
  future: "bg-transparent",
};
