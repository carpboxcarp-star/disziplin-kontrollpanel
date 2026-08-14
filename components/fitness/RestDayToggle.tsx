"use client";

import { useState } from "react";
import { setRestDay } from "@/lib/actions/fitness";

export function RestDayToggle({
  date,
  isRestDay,
  locked,
}: {
  date: string;
  isRestDay: boolean;
  locked: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setPending(true);
    setError(null);
    const { error: err } = await setRestDay(date, !isRestDay);
    if (err) {
      console.error("set_rest_day fehlgeschlagen:", err);
      setError("Fehlgeschlagen — bitte erneut versuchen.");
    }
    setPending(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={locked || pending}
        className={`w-full min-h-[56px] rounded-lg border flex items-center justify-center gap-2 text-sm font-medium transition disabled:opacity-50 ${
          isRestDay
            ? "border-amber bg-amber/10 text-amber"
            : "border-border bg-panel-raised text-ink-dim active:border-amber"
        }`}
      >
        <span aria-hidden>🛌</span>
        {isRestDay ? "Rest Day aktiv — antippen zum Aufheben" : "Als Rest Day markieren"}
      </button>
      {error && <p className="text-xs text-status-missed mt-1.5 text-center">{error}</p>}
    </div>
  );
}
