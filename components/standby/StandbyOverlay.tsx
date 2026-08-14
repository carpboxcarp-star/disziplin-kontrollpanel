"use client";

import { useEffect, useState } from "react";
import { useStandby } from "@/lib/context/StandbyContext";
import { wakeUp } from "@/lib/actions/today";
import { formatClock } from "@/lib/utils/date";

export function StandbyOverlay() {
  const { phase, alarmTime, exitStandby, setAlarmTime } = useStandby();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    if (phase === "off") return;
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  if (phase === "off") return null;

  async function handleWake() {
    exitStandby();
    const { error } = await wakeUp();
    if (error) console.error("wakeUp fehlgeschlagen:", error);
  }

  if (phase === "alarm") {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-linear-to-b from-amber/25 via-bg to-bg">
        <p className="font-display text-8xl text-amber tabular-nums">
          {now ? formatClock(now).slice(0, 5) : "--:--"}
        </p>
        <button
          type="button"
          onClick={handleWake}
          className="min-h-[72px] px-12 rounded-full bg-amber text-bg text-xl font-semibold animate-pulse active:scale-95 transition"
        >
          Aufwachen
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-10 bg-black">
      <p className="font-display text-4xl text-neutral-700 tabular-nums">
        {now ? formatClock(now).slice(0, 5) : "--:--"}
      </p>

      <button
        type="button"
        onClick={handleWake}
        className="text-sm text-neutral-600 tracking-wide active:text-neutral-400 transition py-4 px-8"
      >
        Aufwachen
      </button>

      <div className="flex flex-col items-center gap-1.5">
        <label htmlFor="alarm-time" className="text-[11px] text-neutral-700">
          Wecker
        </label>
        <input
          id="alarm-time"
          type="time"
          value={alarmTime ?? ""}
          onChange={(e) => setAlarmTime(e.target.value || null)}
          className="h-9 w-28 rounded bg-transparent border border-neutral-800 px-2 text-center text-sm text-neutral-500 outline-none focus:border-neutral-600 [color-scheme:dark]"
        />
        {alarmTime && (
          <button
            type="button"
            onClick={() => setAlarmTime(null)}
            className="text-[11px] text-neutral-700 active:text-neutral-500"
          >
            Wecker löschen
          </button>
        )}
      </div>
    </div>
  );
}
