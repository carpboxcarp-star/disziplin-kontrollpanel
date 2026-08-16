import { Panel, PanelTitle } from "@/components/ui/Panel";
import { addDaysStr, todayStr } from "@/lib/utils/date";
import { computeDayStatus, STATUS_COLOR } from "@/lib/utils/calendar";
import type { DailyLog, HabitDefinition, HabitEntry } from "@/lib/types";

const WEEKS = 12;

export function CalendarStrip({
  dailyLogs,
  habitEntries,
  habitDefinitions,
  onSelectDate,
}: {
  dailyLogs: DailyLog[];
  habitEntries: HabitEntry[];
  habitDefinitions: HabitDefinition[];
  onSelectDate: (date: string) => void;
}) {
  const today = todayStr();
  const days = Array.from({ length: WEEKS * 7 }).map((_, i) =>
    addDaysStr(today, -(WEEKS * 7 - 1 - i)),
  );

  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <Panel>
      <PanelTitle>Letzte {WEEKS} Wochen — vergangene Tage antippen zum Bearbeiten</PanelTitle>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date) => {
              const info = computeDayStatus(date, today, dailyLogs, habitEntries, habitDefinitions);
              const clickable = date < today;
              return (
                <button
                  key={date}
                  type="button"
                  disabled={!clickable}
                  onClick={() => onSelectDate(date)}
                  title={`${date}${info.note ? ` — ${info.note}` : ""}`}
                  className="p-1 -m-1 disabled:cursor-default"
                >
                  <span className={`block h-4 w-4 rounded-sm ${STATUS_COLOR[info.status]}`} />
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-ink-dim">
        <Legend color="bg-status-full" label="voll erfüllt" />
        <Legend color="bg-status-partial" label="teilweise" />
        <Legend color="bg-status-missed" label="verpasst" />
        <Legend color="bg-status-skipped" label="geskippt" />
      </div>
    </Panel>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${color}`} />
      {label}
    </span>
  );
}
