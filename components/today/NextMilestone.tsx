import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Milestone } from "@/lib/types";

export function NextMilestone({
  milestones,
  currentStreak,
}: {
  milestones: Milestone[];
  currentStreak: number;
}) {
  const next = [...milestones]
    .filter((m) => !m.achieved_at)
    .sort((a, b) => a.target_streak - b.target_streak)[0];

  if (!next) return null;

  const remaining = Math.max(0, next.target_streak - currentStreak);

  return (
    <div className="rounded-lg border border-border bg-panel px-4 py-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs uppercase tracking-wider text-ink-dim">Nächste Belohnung</span>
        <span className="text-sm text-ink">{next.name}</span>
      </div>
      <ProgressBar value={currentStreak} max={next.target_streak} />
      <p className="text-xs text-ink-dim mt-1.5">
        {next.target_streak} Tage Streak — noch {remaining} {remaining === 1 ? "Tag" : "Tage"}
      </p>
    </div>
  );
}
