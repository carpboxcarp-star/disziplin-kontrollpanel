"use client";

import { useState } from "react";
import { PanelTitle } from "@/components/ui/Panel";
import { setSleepTimestamp } from "@/lib/actions/today";
import { formatTime } from "@/lib/utils/date";
import { computeSleepDuration } from "@/lib/utils/sleep";
import type { DailyLog } from "@/lib/types";

export function SleepButtons({ dailyLog, locked }: { dailyLog: DailyLog | null; locked: boolean }) {
  const [pending, setPending] = useState<"sleep_start" | "wake_time" | null>(null);

  async function handle(field: "sleep_start" | "wake_time") {
    if (!dailyLog) return;
    setPending(field);
    await setSleepTimestamp(dailyLog.id, field);
    setPending(null);
  }

  const duration = computeSleepDuration(dailyLog?.sleep_start ?? null, dailyLog?.wake_time ?? null);

  return (
    <div>
      <PanelTitle>Schlaf</PanelTitle>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={locked || !dailyLog || pending === "sleep_start"}
          onClick={() => handle("sleep_start")}
          className={`min-h-[92px] rounded-lg border flex flex-col items-center justify-center gap-1 transition disabled:opacity-50 ${
            dailyLog?.sleep_start
              ? "border-amber bg-amber/10"
              : "border-border bg-panel-raised active:border-amber"
          }`}
        >
          <span className="text-2xl" aria-hidden>
            🌙
          </span>
          <span className="text-sm font-medium text-ink">Schlafen gehen</span>
          <span className="text-xs text-ink-dim tabular-nums">
            {formatTime(dailyLog?.sleep_start ?? null)}
          </span>
        </button>
        <button
          type="button"
          disabled={locked || !dailyLog || pending === "wake_time"}
          onClick={() => handle("wake_time")}
          className={`min-h-[92px] rounded-lg border flex flex-col items-center justify-center gap-1 transition disabled:opacity-50 ${
            dailyLog?.wake_time
              ? "border-amber bg-amber/10"
              : "border-border bg-panel-raised active:border-amber"
          }`}
        >
          <span className="text-2xl" aria-hidden>
            ☀️
          </span>
          <span className="text-sm font-medium text-ink">Aufgewacht</span>
          <span className="text-xs text-ink-dim tabular-nums">
            {formatTime(dailyLog?.wake_time ?? null)}
          </span>
        </button>
      </div>
      {duration && (
        <p className="text-xs text-ink-dim mt-2">
          Schlafdauer: <span className="text-amber">{duration}</span>
        </p>
      )}
    </div>
  );
}
