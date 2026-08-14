"use client";

import { useState } from "react";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { logSupplement } from "@/lib/actions/fitness";
import type { SupplementLog } from "@/lib/types";

export function SupplementTracker({
  userId,
  date,
  logs,
  proteinGoal,
}: {
  userId: string;
  date: string;
  logs: SupplementLog[];
  proteinGoal: number;
}) {
  const [customGrams, setCustomGrams] = useState("");

  const totalGrams = logs
    .filter((l) => l.type !== "creatine")
    .reduce((sum, l) => sum + (l.grams ?? 0), 0);
  const creatineToday = logs.some((l) => l.type === "creatine");
  const remaining = Math.max(0, proteinGoal - totalGrams);

  async function add(type: SupplementLog["type"], grams: number | null) {
    await logSupplement(userId, date, type, grams);
  }

  return (
    <Panel>
      <PanelTitle>Protein &amp; Supplements</PanelTitle>

      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-display text-3xl text-amber">{totalGrams}g</span>
          <span className="text-xs text-ink-dim">
            noch {remaining}g bis {proteinGoal}g Ziel
          </span>
        </div>
        <ProgressBar value={totalGrams} max={proteinGoal} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => add("shake", 25)}
          className="min-h-[52px] flex-1 rounded-md border border-border bg-panel-raised text-sm text-ink px-3"
        >
          +1 Shake (25g)
        </button>
        <button
          type="button"
          onClick={() => add("riegel", 20)}
          className="min-h-[52px] flex-1 rounded-md border border-border bg-panel-raised text-sm text-ink px-3"
        >
          +1 Riegel (20g)
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const g = parseInt(customGrams, 10);
          if (!isNaN(g) && g > 0) {
            add("custom", g);
            setCustomGrams("");
          }
        }}
        className="flex gap-2 mb-4"
      >
        <input
          inputMode="numeric"
          placeholder="+X g (Mahlzeit)"
          value={customGrams}
          onChange={(e) => setCustomGrams(e.target.value)}
          className="h-11 flex-1 rounded border border-border bg-panel-raised px-3 text-sm text-ink outline-none focus:border-amber"
        />
        <button type="submit" className="h-11 px-4 rounded-md border border-border text-sm text-amber">
          +
        </button>
      </form>

      <button
        type="button"
        onClick={() => add("creatine", null)}
        disabled={creatineToday}
        className={`w-full min-h-[52px] rounded-md border flex items-center justify-center gap-2 text-sm ${
          creatineToday ? "border-amber bg-amber/10 text-amber" : "border-border text-ink-dim"
        }`}
      >
        {creatineToday ? "✓ Kreatin genommen" : "+1x Kreatin"}
      </button>
    </Panel>
  );
}
