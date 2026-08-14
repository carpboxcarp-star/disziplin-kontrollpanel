"use client";

import { useState } from "react";
import { SkipLink } from "@/components/ui/SkipLink";
import { setHabitStatus } from "@/lib/actions/today";
import type { HabitDefinition, HabitEntry } from "@/lib/types";

interface HabitGridProps {
  definitions: HabitDefinition[];
  entries: HabitEntry[];
  date: string;
  locked: boolean;
}

export function HabitGrid({ definitions, entries, date, locked }: HabitGridProps) {
  const [pending, setPending] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState<string | null>(null);

  async function update(key: string, status: "done" | "missed" | "skipped", note?: string) {
    setPending(key);
    setErrorKey(null);
    const { error } = await setHabitStatus(date, key, status, note);
    if (error) {
      console.error(`set_habit_status(${key}, ${status}) fehlgeschlagen:`, error);
      setErrorKey(key);
    } else if (status === "done") {
      setFlashKey(key);
      setTimeout(() => setFlashKey((current) => (current === key ? null : current)), 700);
    }
    setPending(null);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {definitions.map((def) => {
        const autoManaged = def.key === "protein";
        const entry = entries.find((e) => e.habit_key === def.key);
        const status = entry?.status ?? "missed";
        const done = status === "done";
        const skipped = status === "skipped";
        const disabled = locked || skipped || autoManaged || pending === def.key;

        return (
          <div
            key={def.key}
            className={`relative rounded-lg border p-4 min-h-[112px] flex flex-col justify-between transition ${
              done
                ? "border-amber bg-amber/10"
                : skipped
                  ? "border-border bg-panel-raised opacity-60"
                  : "border-border bg-panel-raised"
            } ${flashKey === def.key ? "animate-success-flash" : ""}`}
          >
            <button
              type="button"
              role="switch"
              aria-checked={done}
              disabled={disabled}
              onClick={() => update(def.key, done ? "missed" : "done")}
              className="flex-1 flex flex-col items-start text-left gap-1 disabled:cursor-default"
            >
              <span
                className={`h-8 w-8 rounded-full border flex items-center justify-center text-sm mb-1 ${
                  done ? "border-amber bg-amber text-bg" : "border-border text-transparent"
                }`}
              >
                ✓
              </span>
              <span className={`text-sm font-medium leading-tight ${done ? "text-amber" : "text-ink"}`}>
                {def.label}
              </span>
              <span className="text-xs text-ink-dim">
                {autoManaged ? "automatisch" : def.is_bonus ? "Bonus" : null} +{def.points} Pkt
              </span>
            </button>

            {!locked && !autoManaged && (
              <div className="mt-2">
                <SkipLink
                  skipped={skipped}
                  note={entry?.skip_note ?? null}
                  onSkip={(note) => update(def.key, "skipped", note)}
                  onUnskip={() => update(def.key, "missed")}
                />
              </div>
            )}
            {errorKey === def.key && (
              <p className="text-[10px] text-status-missed mt-1">Fehler beim Speichern</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
