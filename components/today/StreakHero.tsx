function flamesFor(streak: number): string {
  if (streak >= 30) return "🔥🔥🔥";
  if (streak >= 14) return "🔥🔥";
  if (streak >= 3) return "🔥";
  return "";
}

export function StreakHero({ streak, points }: { streak: number; points: number }) {
  const flames = flamesFor(streak);

  return (
    <div className="rounded-lg border border-amber/40 bg-linear-to-br from-amber/10 to-transparent p-6 flex items-center justify-between">
      <div className="animate-streak-in">
        <div className="flex items-end gap-2">
          <span className="font-display text-8xl leading-none text-amber tabular-nums">
            {streak}
          </span>
          {flames && (
            <span className="text-4xl mb-2 animate-flame" aria-hidden>
              {flames}
            </span>
          )}
        </div>
        <p className="text-xs uppercase tracking-wider text-ink-dim mt-1">Tage Streak</p>
      </div>
      <div className="text-right">
        <p className="font-display text-4xl text-ink tabular-nums">{points}</p>
        <p className="text-xs uppercase tracking-wider text-ink-dim mt-1">Punkte gesamt</p>
      </div>
    </div>
  );
}
