"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";
import { SkipLink } from "@/components/ui/SkipLink";
import { setHabitStatus } from "@/lib/actions/today";
import type { HabitDefinition, HabitEntry } from "@/lib/types";

interface HabitListProps {
  definitions: HabitDefinition[];
  entries: HabitEntry[];
  date: string;
  locked: boolean;
}

export function HabitList({ definitions, entries, date, locked }: HabitListProps) {
  const [pending, setPending] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  async function update(key: string, status: "done" | "missed" | "skipped", note?: string) {
    setPending(key);
    setErrorKey(null);
    const { error } = await setHabitStatus(date, key, status, note);
    if (error) {
      console.error(`set_habit_status(${key}, ${status}) fehlgeschlagen:`, error);
      setErrorKey(key);
    }
    setPending(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {definitions.map((def) => {
        const autoManaged = def.key === "protein";
        const entry = entries.find((e) => e.habit_key === def.key);
        const status = entry?.status ?? "missed";
        const skipped = status === "skipped";

        return (
          <div key={def.key} className="flex flex-col gap-1.5">
            <Toggle
              checked={status === "done"}
              disabled={locked || skipped || autoManaged || pending === def.key}
              label={def.label}
              sublabel={
                autoManaged
                  ? `automatisch · +${def.points} Punkte`
                  : `${def.is_bonus ? "Bonus " : ""}+${def.points} Punkte`
              }
              onChange={(checked) => update(def.key, checked ? "done" : "missed")}
            />
            {!locked && !autoManaged && (
              <div className="pl-1">
                <SkipLink
                  skipped={skipped}
                  note={entry?.skip_note ?? null}
                  onSkip={(note) => update(def.key, "skipped", note)}
                  onUnskip={() => update(def.key, "missed")}
                />
              </div>
            )}
            {errorKey === def.key && (
              <p className="text-xs text-status-missed pl-1">
                Speichern fehlgeschlagen — bitte erneut versuchen.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
