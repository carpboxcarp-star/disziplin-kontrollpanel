import { ProgressBar } from "@/components/ui/ProgressBar";
import type { BalanceEntry } from "@/lib/types";

const MAX_BALANCE = 5000;

export function BalanceBar({ entries }: { entries: BalanceEntry[] }) {
  const sorted = [...entries].sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1));
  const latest = sorted[0] ?? null;

  return (
    <div className="rounded-lg border border-border bg-panel px-4 py-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs uppercase tracking-wider text-ink-dim">Kontostand</span>
        <span className="text-sm text-amber tabular-nums">
          {latest ? `${Number(latest.amount).toFixed(0)} €` : "—"} / {MAX_BALANCE} €
        </span>
      </div>
      <ProgressBar value={latest ? Number(latest.amount) : 0} max={MAX_BALANCE} />
    </div>
  );
}
