"use client";

import { useState } from "react";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { logSupplement, deleteSupplementLog } from "@/lib/actions/fitness";
import type { SupplementLog } from "@/lib/types";

const TYPE_ICON: Record<SupplementLog["type"], string> = {
  shake: "🥤",
  riegel: "🍫",
  custom: "🍽️",
  creatine: "💊",
};

const TYPE_LABEL: Record<SupplementLog["type"], string> = {
  shake: "Shake",
  riegel: "Riegel",
  custom: "Mahlzeit",
  creatine: "Kreatin",
};

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
  const creatineEntry = logs.find((l) => l.type === "creatine") ?? null;
  const remaining = Math.max(0, proteinGoal - totalGrams);

  async function add(type: SupplementLog["type"], grams: number | null) {
    await logSupplement(userId, date, type, grams);
  }

  async function toggleCreatine() {
    if (creatineEntry) {
      await deleteSupplementLog(creatineEntry.id);
    } else {
      await add("creatine", null);
    }
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

      {logs.filter((l) => l.type !== "creatine").length > 0 && (
        <ul className="flex flex-col gap-1.5 mb-4">
          {logs
            .filter((l) => l.type !== "creatine")
            .map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-panel-raised px-3 py-2"
              >
                <span className="text-sm text-ink flex items-center gap-2">
                  <span aria-hidden>{TYPE_ICON[l.type]}</span>
                  {TYPE_LABEL[l.type]} · {l.grams ?? 0}g
                </span>
                <button
                  type="button"
                  onClick={() => deleteSupplementLog(l.id)}
                  aria-label={`${TYPE_LABEL[l.type]}-Eintrag entfernen`}
                  className="h-9 w-9 shrink-0 rounded-md border border-border text-ink-dim text-lg flex items-center justify-center active:border-status-missed active:text-status-missed"
                >
                  −
                </button>
              </li>
            ))}
        </ul>
      )}

      <button
        type="button"
        onClick={toggleCreatine}
        className={`w-full min-h-[52px] rounded-md border flex items-center justify-center gap-2 text-sm transition ${
          creatineEntry ? "border-amber bg-amber/10 text-amber" : "border-border text-ink-dim"
        }`}
      >
        {creatineEntry ? "✓ Kreatin genommen — antippen zum Rückgängigmachen" : "+1x Kreatin"}
      </button>
    </Panel>
  );
}
