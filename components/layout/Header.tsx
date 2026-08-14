"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/lib/context/DashboardContext";
import { useWakeLock } from "@/lib/hooks/useWakeLock";
import { formatClock } from "@/lib/utils/date";

export function Header() {
  const { userStats } = useDashboard();
  const [now, setNow] = useState<Date | null>(null);

  useWakeLock();

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-bg px-5 py-3">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-6xl text-amber leading-none">
          {userStats?.current_streak ?? 0}
        </span>
        <span className="text-xs uppercase tracking-wider text-ink-dim">Tage Streak</span>
      </div>

      <div className="flex flex-col items-center leading-none">
        <span className="font-display text-3xl text-ink tabular-nums">
          {now ? formatClock(now) : "--:--:--"}
        </span>
        <span className="text-xs text-ink-dim mt-1">
          {now?.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }) ?? ""}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end leading-none">
          <span className="font-display text-3xl text-ink tabular-nums">
            {userStats?.total_points ?? 0}
          </span>
          <span className="text-xs uppercase tracking-wider text-ink-dim mt-1">Punkte</span>
        </div>
        <Link
          href="/settings"
          aria-label="Einstellungen"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink-dim hover:text-amber hover:border-amber transition"
        >
          <GearIcon />
        </Link>
      </div>
    </header>
  );
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
