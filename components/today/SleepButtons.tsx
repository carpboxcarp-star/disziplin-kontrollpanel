"use client";

import { useState } from "react";
import { Panel, PanelTitle } from "@/components/ui/Panel";
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
    <Panel>
      <PanelTitle>Schlaf</PanelTitle>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={locked || !dailyLog || pending === "sleep_start"}
          onClick={() => handle("sleep_start")}
          className="flex-1 min-h-[64px] rounded-md border border-border bg-panel-raised disabled:opacity-50 flex flex-col items-center justify-center gap-0.5"
        >
          <span className="text-sm font-medium text-ink">Schlafen gehen</span>
          <span className="text-xs text-ink-dim tabular-nums">
            {formatTime(dailyLog?.sleep_start ?? null)}
          </span>
        </button>
        <button
          type="button"
          disabled={locked || !dailyLog || pending === "wake_time"}
          onClick={() => handle("wake_time")}
          className="flex-1 min-h-[64px] rounded-md border border-border bg-panel-raised disabled:opacity-50 flex flex-col items-center justify-center gap-0.5"
        >
          <span className="text-sm font-medium text-ink">Aufgewacht</span>
          <span className="text-xs text-ink-dim tabular-nums">
            {formatTime(dailyLog?.wake_time ?? null)}
          </span>
        </button>
      </div>
      {duration && (
        <p className="text-xs text-ink-dim mt-3">
          Schlafdauer: <span className="text-amber">{duration}</span>
        </p>
      )}
    </Panel>
  );
}
