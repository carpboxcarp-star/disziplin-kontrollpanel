import { addDaysStr, mondayOfWeek } from "@/lib/utils/date";
import { computeDayStatus, STATUS_COLOR } from "@/lib/utils/calendar";
import type { DailyLog, HabitDefinition, HabitEntry } from "@/lib/types";

const DAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function WeekStrip({
  today,
  dailyLogs,
  habitEntries,
  habitDefinitions,
}: {
  today: string;
  dailyLogs: DailyLog[];
  habitEntries: HabitEntry[];
  habitDefinitions: HabitDefinition[];
}) {
  const monday = mondayOfWeek(today);
  const days = Array.from({ length: 7 }).map((_, i) => addDaysStr(monday, i));

  return (
    <div className="rounded-lg border border-border bg-panel px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-ink-dim mb-2.5">Diese Woche</p>
      <div className="flex justify-between">
        {days.map((date, i) => {
          const info = computeDayStatus(date, today, dailyLogs, habitEntries, habitDefinitions);
          const isToday = date === today;
          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-ink-dim">{DAY_LABELS[i]}</span>
              <div
                title={date}
                className={`h-6 w-6 rounded-full ${STATUS_COLOR[info.status]} ${
                  isToday ? "ring-2 ring-amber ring-offset-2 ring-offset-panel" : ""
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
