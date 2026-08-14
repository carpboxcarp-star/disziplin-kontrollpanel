"use client";

import { useState } from "react";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import { addBalance, deleteBalance } from "@/lib/actions/finance";
import { todayStr } from "@/lib/utils/date";
import type { BalanceEntry } from "@/lib/types";

export function BalanceTracker({ userId, entries }: { userId: string; entries: BalanceEntry[] }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());

  const sorted = [...entries].sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1));
  const latest = sorted[0] ?? null;

  return (
    <Panel>
      <PanelTitle>Kontostand</PanelTitle>
      <p className="font-display text-5xl text-amber mb-1">
        {latest ? `${Number(latest.amount).toFixed(2)} €` : "—"}
      </p>
      {latest && <p className="text-xs text-ink-dim mb-4">Stand vom {latest.entry_date}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const a = parseFloat(amount.replace(",", "."));
          if (isNaN(a)) return;
          addBalance(userId, a, date);
          setAmount("");
        }}
        className="flex gap-2 mb-4"
      >
        <input
          inputMode="decimal"
          placeholder="Kontostand €"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-12 flex-1 rounded border border-border bg-panel-raised px-3 text-sm text-ink outline-none focus:border-amber"
        />
        <input
          type="date"
          value={date}
          max={todayStr()}
          onChange={(e) => setDate(e.target.value)}
          className="h-12 flex-1 rounded border border-border bg-panel-raised px-3 text-sm text-ink outline-none focus:border-amber"
        />
        <button type="submit" className="h-12 px-5 rounded-md bg-amber text-bg text-sm font-semibold">
          +
        </button>
      </form>

      <ul className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
        {sorted.map((e) => (
          <li key={e.id} className="flex items-center justify-between text-sm">
            <span className="text-ink-dim">{e.entry_date}</span>
            <div className="flex items-center gap-2">
              <span className="text-ink">{Number(e.amount).toFixed(2)} €</span>
              <button type="button" onClick={() => deleteBalance(e.id)} className="text-ink-dim">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
