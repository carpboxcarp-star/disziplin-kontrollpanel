"use client";

import { useState } from "react";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import { updateWeekdaySchedule, updateSettings } from "@/lib/actions/settings";
import type { Settings, WeekdaySchedule } from "@/lib/types";

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABELS: Record<number, string> = {
  0: "Sonntag",
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
};

export function SchedulePanel({
  userId,
  schedule,
  settings,
}: {
  userId: string;
  schedule: WeekdaySchedule[];
  settings: Settings | null;
}) {
  const [wakeBuffer, setWakeBuffer] = useState(settings?.wake_buffer_minutes ?? 45);
  const [sleepHours, setSleepHours] = useState(settings?.target_sleep_hours ?? 7.5);

  return (
    <Panel>
      <PanelTitle>Schul-Stundenplan</PanelTitle>

      <div className="flex flex-col gap-2 mb-5">
        {WEEKDAY_ORDER.map((weekday) => {
          const row = schedule.find((s) => s.weekday === weekday);
          return (
            <div key={weekday} className="flex items-center gap-2">
              <span className="w-24 text-sm text-ink-dim shrink-0">{WEEKDAY_LABELS[weekday]}</span>
              <input
                type="time"
                defaultValue={row?.first_lesson_time?.slice(0, 5) ?? ""}
                onBlur={(e) =>
                  updateWeekdaySchedule(
                    userId,
                    weekday,
                    e.target.value || null,
                    row?.commute_minutes ?? 30,
                  )
                }
                className="h-11 flex-1 rounded border border-border bg-panel-raised px-2 text-sm text-ink outline-none focus:border-amber"
              />
              <input
                inputMode="numeric"
                defaultValue={row?.commute_minutes ?? 30}
                onBlur={(e) =>
                  updateWeekdaySchedule(
                    userId,
                    weekday,
                    row?.first_lesson_time?.slice(0, 5) ?? null,
                    parseInt(e.target.value, 10) || 0,
                  )
                }
                className="h-11 w-20 rounded border border-border bg-panel-raised px-2 text-sm text-ink text-center outline-none focus:border-amber"
                title="Anfahrtszeit in Minuten"
              />
              <span className="text-xs text-ink-dim">min</span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <label className="flex-1 flex flex-col gap-1 text-xs text-ink-dim">
          Aufstehpuffer (min)
          <input
            inputMode="numeric"
            value={wakeBuffer}
            onChange={(e) => setWakeBuffer(Number(e.target.value))}
            onBlur={() => updateSettings(userId, { wake_buffer_minutes: wakeBuffer })}
            className="h-11 rounded border border-border bg-panel-raised px-2 text-sm text-ink outline-none focus:border-amber"
          />
        </label>
        <label className="flex-1 flex flex-col gap-1 text-xs text-ink-dim">
          Zielschlaf (Std)
          <input
            inputMode="decimal"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            onBlur={() => updateSettings(userId, { target_sleep_hours: sleepHours })}
            className="h-11 rounded border border-border bg-panel-raised px-2 text-sm text-ink outline-none focus:border-amber"
          />
        </label>
      </div>
    </Panel>
  );
}
