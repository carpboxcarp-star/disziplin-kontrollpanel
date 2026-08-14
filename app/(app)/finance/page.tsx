"use client";

import { useDashboard } from "@/lib/context/DashboardContext";
import { SavingsTracker } from "@/components/finance/SavingsTracker";
import { BalanceTracker } from "@/components/finance/BalanceTracker";

export default function FinancePage() {
  const { ready, userId, savingsEntries, balanceEntries, settings } = useDashboard();

  if (!ready || !userId) {
    return <p className="text-ink-dim text-sm p-4">Lade...</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <SavingsTracker userId={userId} entries={savingsEntries} settings={settings} />
      <BalanceTracker userId={userId} entries={balanceEntries} />
    </div>
  );
}
