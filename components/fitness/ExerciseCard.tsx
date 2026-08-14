"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import {
  ensureExerciseLog,
  setExerciseCompleted,
  upsertExerciseSet,
} from "@/lib/actions/fitness";
import type { ExerciseDefinition, ExerciseLog, ExerciseSet } from "@/lib/types";

interface ExerciseCardProps {
  definition: ExerciseDefinition;
  userId: string;
  date: string;
  exerciseLog: ExerciseLog | null;
  sets: ExerciseSet[];
  onOpenHistory: () => void;
}

export function ExerciseCard({
  definition,
  userId,
  date,
  exerciseLog,
  sets,
  onOpenHistory,
}: ExerciseCardProps) {
  const rowCount = Math.max(definition.sets_target, sets.length);
  const initial = useMemo(() => {
    const rows: { weight: string; reps: string }[] = [];
    for (let i = 1; i <= rowCount; i++) {
      const s = sets.find((x) => x.set_number === i);
      rows.push({ weight: s?.weight_kg?.toString() ?? "", reps: s?.reps?.toString() ?? "" });
    }
    return rows;
  }, [rowCount, sets]);

  const [rows, setRows] = useState(initial);
  const [extraRows, setExtraRows] = useState(0);
  const [saving, setSaving] = useState(false);

  async function withLog(): Promise<ExerciseLog> {
    if (exerciseLog) return exerciseLog;
    return ensureExerciseLog(userId, definition.id, date);
  }

  async function saveSet(index: number) {
    setSaving(true);
    const log = await withLog();
    const row = rows[index];
    const weight = row.weight ? parseFloat(row.weight.replace(",", ".")) : null;
    const reps = row.reps ? parseInt(row.reps, 10) : null;
    await upsertExerciseSet(log.id, index + 1, weight, reps);
    setSaving(false);
  }

  async function toggleCompleted() {
    setSaving(true);
    const log = await withLog();
    await setExerciseCompleted(log.id, !log.completed);
    setSaving(false);
  }

  const totalRows = rowCount + extraRows;

  return (
    <Panel>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-medium text-ink">{definition.name}</h3>
          <p className="text-xs text-ink-dim">
            Ziel: {definition.sets_target} Sätze × {definition.reps_target} Wdh
          </p>
        </div>
        <button
          type="button"
          onClick={toggleCompleted}
          disabled={saving}
          className={`shrink-0 h-11 w-11 rounded-md border flex items-center justify-center text-lg ${
            exerciseLog?.completed
              ? "border-amber bg-amber/10 text-amber"
              : "border-border text-ink-dim"
          }`}
          aria-label="Übung abhaken"
        >
          {exerciseLog?.completed ? "✓" : ""}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: totalRows }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 text-xs text-ink-dim">{i + 1}.</span>
            <input
              inputMode="decimal"
              placeholder="kg"
              value={rows[i]?.weight ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setRows((r) => {
                  const next = [...r];
                  next[i] = { weight: v, reps: next[i]?.reps ?? "" };
                  return next;
                });
              }}
              onBlur={() => saveSet(i)}
              className="h-11 w-20 rounded border border-border bg-panel-raised px-2 text-sm text-ink text-center outline-none focus:border-amber"
            />
            <span className="text-ink-dim text-sm">×</span>
            <input
              inputMode="numeric"
              placeholder="Wdh"
              value={rows[i]?.reps ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setRows((r) => {
                  const next = [...r];
                  next[i] = { weight: next[i]?.weight ?? "", reps: v };
                  return next;
                });
              }}
              onBlur={() => saveSet(i)}
              className="h-11 w-20 rounded border border-border bg-panel-raised px-2 text-sm text-ink text-center outline-none focus:border-amber"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          onClick={() => {
            setExtraRows((n) => n + 1);
            setRows((r) => [...r, { weight: "", reps: "" }]);
          }}
          className="text-xs text-ink-dim"
        >
          + Satz
        </button>
        <button type="button" onClick={onOpenHistory} className="text-xs text-amber">
          Verlauf
        </button>
      </div>
    </Panel>
  );
}
