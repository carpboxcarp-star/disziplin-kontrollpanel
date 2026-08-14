"use client";

import { useState } from "react";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import { updateHabitDefinition, updateSettings } from "@/lib/actions/settings";
import type { HabitDefinition, Settings } from "@/lib/types";

export function PointsEditor({
  userId,
  definitions,
  settings,
}: {
  userId: string;
  definitions: HabitDefinition[];
  settings: Settings | null;
}) {
  const [proteinGoal, setProteinGoal] = useState(settings?.protein_goal_g ?? 140);
  const [todoBonus, setTodoBonus] = useState(settings?.todo_bonus_points ?? 15);

  const sorted = [...definitions].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <Panel>
      <PanelTitle>Punktwerte &amp; Ziele</PanelTitle>

      <div className="flex flex-col gap-2 mb-5">
        {sorted.map((def) => (
          <div key={def.id} className="flex items-center gap-2">
            <span className="flex-1 text-sm text-ink truncate">{def.label}</span>
            <input
              inputMode="numeric"
              defaultValue={def.points}
              onBlur={(e) => updateHabitDefinition(def.id, { points: Number(e.target.value) || 0 })}
              className="h-11 w-20 rounded border border-border bg-panel-raised px-2 text-sm text-ink text-center outline-none focus:border-amber"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <label className="flex-1 flex flex-col gap-1 text-xs text-ink-dim">
          Protein-Ziel (g)
          <input
            inputMode="numeric"
            value={proteinGoal}
            onChange={(e) => setProteinGoal(Number(e.target.value))}
            onBlur={() => updateSettings(userId, { protein_goal_g: proteinGoal })}
            className="h-11 rounded border border-border bg-panel-raised px-2 text-sm text-ink outline-none focus:border-amber"
          />
        </label>
        <label className="flex-1 flex flex-col gap-1 text-xs text-ink-dim">
          To-do Bonus (Pkt)
          <input
            inputMode="numeric"
            value={todoBonus}
            onChange={(e) => setTodoBonus(Number(e.target.value))}
            onBlur={() => updateSettings(userId, { todo_bonus_points: todoBonus })}
            className="h-11 rounded border border-border bg-panel-raised px-2 text-sm text-ink outline-none focus:border-amber"
          />
        </label>
      </div>
    </Panel>
  );
}
