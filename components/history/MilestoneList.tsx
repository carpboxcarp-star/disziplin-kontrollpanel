"use client";

import { useState } from "react";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import { addMilestone, deleteMilestone } from "@/lib/actions/history";
import type { Milestone } from "@/lib/types";

export function MilestoneList({
  userId,
  milestones,
  currentStreak,
}: {
  userId: string;
  milestones: Milestone[];
  currentStreak: number;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const sorted = [...milestones].sort((a, b) => a.target_streak - b.target_streak);

  return (
    <Panel>
      <PanelTitle>Belohnungen &amp; Meilensteine</PanelTitle>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const t = parseInt(target, 10);
          if (!name.trim() || isNaN(t) || t <= 0) return;
          addMilestone(userId, name.trim(), t);
          setName("");
          setTarget("");
        }}
        className="flex gap-2 mb-4"
      >
        <input
          placeholder="Belohnung (z.B. neue Schuhe)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 flex-1 rounded border border-border bg-panel-raised px-3 text-sm text-ink outline-none focus:border-amber"
        />
        <input
          inputMode="numeric"
          placeholder="Streak"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="h-12 w-24 rounded border border-border bg-panel-raised px-3 text-sm text-ink outline-none focus:border-amber"
        />
        <button type="submit" className="h-12 px-5 rounded-md bg-amber text-bg text-sm font-semibold">
          +
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {sorted.map((m) => {
          const achieved = !!m.achieved_at;
          return (
            <li
              key={m.id}
              className={`flex items-center justify-between gap-3 rounded-md border px-4 py-3 ${
                achieved ? "border-amber bg-amber/10" : "border-border bg-panel-raised"
              }`}
            >
              <div>
                <p className={`text-sm ${achieved ? "text-amber" : "text-ink"}`}>{m.name}</p>
                <p className="text-xs text-ink-dim">
                  ab {m.target_streak} Tage Streak
                  {achieved ? " · erreicht 🏆" : ` · noch ${Math.max(0, m.target_streak - currentStreak)} Tage`}
                </p>
              </div>
              <button type="button" onClick={() => deleteMilestone(m.id)} className="text-ink-dim text-sm">
                ✕
              </button>
            </li>
          );
        })}
        {sorted.length === 0 && <p className="text-sm text-ink-dim">Noch keine Meilensteine.</p>}
      </ul>
    </Panel>
  );
}
