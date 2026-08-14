"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { todayStr } from "@/lib/utils/date";
import { currentSplitDay } from "@/lib/utils/split";
import { SplitDayCard } from "@/components/fitness/SplitDayCard";
import { ExerciseCard } from "@/components/fitness/ExerciseCard";
import { ExerciseHistoryPanel } from "@/components/fitness/ExerciseHistoryPanel";
import { SupplementTracker } from "@/components/fitness/SupplementTracker";
import { PanelTitle } from "@/components/ui/Panel";
import type { ExerciseDefinition } from "@/lib/types";

export default function FitnessPage() {
  const {
    ready,
    userId,
    exerciseDefinitions,
    exerciseLogs,
    exerciseSets,
    splitRotation,
    supplementLogs,
    settings,
  } = useDashboard();
  const [historyFor, setHistoryFor] = useState<ExerciseDefinition | null>(null);

  if (!ready || !userId) {
    return <p className="text-ink-dim text-sm p-4">Lade...</p>;
  }

  const date = todayStr();
  const splitDay = currentSplitDay(splitRotation ?? undefined, date);
  const exercises = exerciseDefinitions
    .filter((e) => e.split_day === splitDay)
    .sort((a, b) => a.sort_order - b.sort_order);

  const todaySupplements = supplementLogs.filter((l) => l.log_date === date);

  return (
    <div className="flex flex-col gap-5">
      <SplitDayCard splitDay={splitDay} />

      <div className="flex flex-col gap-3">
        <PanelTitle>Übungen</PanelTitle>
        {exercises.map((def) => {
          const log = exerciseLogs.find((l) => l.exercise_id === def.id && l.log_date === date) ?? null;
          const sets = log ? exerciseSets.filter((s) => s.exercise_log_id === log.id) : [];
          return (
            <ExerciseCard
              key={def.id}
              definition={def}
              userId={userId}
              date={date}
              exerciseLog={log}
              sets={sets}
              onOpenHistory={() => setHistoryFor(def)}
            />
          );
        })}
      </div>

      <SupplementTracker
        userId={userId}
        date={date}
        logs={todaySupplements}
        proteinGoal={settings?.protein_goal_g ?? 140}
      />

      {historyFor && (
        <ExerciseHistoryPanel
          definition={historyFor}
          logs={exerciseLogs.filter((l) => l.exercise_id === historyFor.id)}
          sets={exerciseSets.filter((s) =>
            exerciseLogs.some((l) => l.id === s.exercise_log_id && l.exercise_id === historyFor.id),
          )}
          onClose={() => setHistoryFor(null)}
        />
      )}
    </div>
  );
}
