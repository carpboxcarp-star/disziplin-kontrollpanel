"use client";

import { Sparkline } from "@/components/ui/Sparkline";
import type { ExerciseDefinition, ExerciseLog, ExerciseSet } from "@/lib/types";

interface Props {
  definition: ExerciseDefinition;
  logs: ExerciseLog[];
  sets: ExerciseSet[];
  onClose: () => void;
}

export function ExerciseHistoryPanel({ definition, logs, sets, onClose }: Props) {
  const sessions = [...logs]
    .sort((a, b) => (a.log_date < b.log_date ? 1 : -1))
    .map((log) => ({
      log,
      sets: sets
        .filter((s) => s.exercise_log_id === log.id)
        .sort((a, b) => a.set_number - b.set_number),
    }))
    .filter((s) => s.sets.some((x) => x.weight_kg !== null || x.reps !== null));

  const sparklineValues = [...sessions]
    .reverse()
    .map((s) => Math.max(0, ...s.sets.map((x) => x.weight_kg ?? 0)))
    .filter((v) => v > 0);

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-lg border border-border bg-panel p-5">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-medium text-ink">{definition.name}</h3>
          <button type="button" onClick={onClose} className="text-ink-dim text-xl leading-none">
            ✕
          </button>
        </div>

        {sparklineValues.length >= 2 && (
          <div className="mb-5">
            <p className="text-xs text-ink-dim mb-2">Gewichtsentwicklung (max. Satzgewicht)</p>
            <Sparkline values={sparklineValues} />
          </div>
        )}

        {sessions.length === 0 ? (
          <p className="text-sm text-ink-dim">Noch keine Einträge.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sessions.map(({ log, sets: logSets }) => (
              <li key={log.id} className="border-b border-border pb-2 last:border-0">
                <p className="text-xs text-ink-dim mb-1">{log.log_date}</p>
                <p className="text-sm text-ink">
                  {logSets
                    .map((s) => `${s.weight_kg ?? "-"}kg × ${s.reps ?? "-"}`)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
