interface ProgressBarProps {
  value: number;
  max: number;
  color?: "amber" | "status-missed";
}

export function ProgressBar({ value, max, color = "amber" }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="h-3 w-full rounded-full bg-panel-raised border border-border overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${
          color === "amber" ? "bg-amber" : "bg-status-missed"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
