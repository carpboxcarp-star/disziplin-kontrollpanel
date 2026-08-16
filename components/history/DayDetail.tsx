"use client";

import { useState } from "react";
import { HabitGrid } from "@/components/today/HabitGrid";
import { CloseDayButton } from "@/components/today/CloseDayButton";
import { UnlockDialog } from "@/components/today/UnlockDialog";
import { formatDateLong } from "@/lib/utils/date";
import type { DailyLog, HabitDefinition, HabitEntry } from "@/lib/types";

interface DayDetailProps {
  date: string;
  dailyLog: DailyLog | null;
  definitions: HabitDefinition[];
  entries: HabitEntry[];
  onClose: () => void;
}

export function DayDetail({ date, dailyLog, definitions, entries, onClose }: DayDetailProps) {
  const [unlockOpen, setUnlockOpen] = useState(false);
  const locked = dailyLog?.locked ?? false;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-lg border border-border bg-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-ink">{formatDateLong(date)}</h3>
          <button type="button" onClick={onClose} className="text-ink-dim text-xl leading-none px-2 -mr-2">
            ✕
          </button>
        </div>

        {!dailyLog ? (
          <p className="text-sm text-ink-dim">Keine Daten für diesen Tag.</p>
        ) : locked ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <span className="text-2xl" aria-hidden>
              🔒
            </span>
            <p className="text-sm text-ink-dim text-center">
              Dieser Tag ist abgeschlossen. PIN eingeben, um ihn zu bearbeiten.
            </p>
            <button
              type="button"
              onClick={() => setUnlockOpen(true)}
              className="h-12 px-6 rounded-md border border-amber text-amber text-sm"
            >
              Bearbeiten
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <HabitGrid definitions={definitions} entries={entries} date={date} locked={false} />
            <CloseDayButton date={date} locked={false} definitions={definitions} entries={entries} />
          </div>
        )}
      </div>

      {unlockOpen && <UnlockDialog date={date} onClose={() => setUnlockOpen(false)} />}
    </div>
  );
}
