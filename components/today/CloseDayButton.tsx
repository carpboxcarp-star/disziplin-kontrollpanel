"use client";

import { useState } from "react";
import { closeDay } from "@/lib/actions/today";
import { missingCoreHabits } from "@/lib/utils/streak";
import type { HabitDefinition, HabitEntry } from "@/lib/types";

export function CloseDayButton({
  date,
  locked,
  definitions,
  entries,
}: {
  date: string;
  locked: boolean;
  definitions: HabitDefinition[];
  entries: HabitEntry[];
}) {
  const [pending, setPending] = useState(false);
  const missing = missingCoreHabits(definitions, entries);

  if (locked) {
    return (
      <div className="rounded-md border border-border bg-panel-raised px-5 py-4 text-center text-sm text-ink-dim">
        Tag abgeschlossen.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {missing.length > 0 && (
        <p className="text-xs text-status-missed text-center">
          Noch offen: {missing.map((m) => m.label).join(", ")} — Streak bricht sonst.
        </p>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          await closeDay(date);
          setPending(false);
        }}
        className="min-h-[64px] rounded-md bg-amber text-bg font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition"
      >
        {pending ? "Schließe ab..." : "Tag abschließen"}
      </button>
    </div>
  );
}
