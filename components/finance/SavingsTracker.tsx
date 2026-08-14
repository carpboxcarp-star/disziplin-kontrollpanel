"use client";

import { useState } from "react";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import { addSaving, deleteSaving } from "@/lib/actions/finance";
import { todayStr } from "@/lib/utils/date";
import type { SavingsEntry } from "@/lib/types";

export function SavingsTracker({ userId, entries }: { userId: string; entries: SavingsEntry[] }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");

  const total = entries.reduce((sum, e) => sum + Number(e.amount), 0);
  const sorted = [...entries].sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1));

  return (
    <Panel>
      <PanelTitle>Erspartes durch kein Gamblen</PanelTitle>
      <p className="font-display text-5xl text-amber mb-4">{total.toFixed(2)} €</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const a = parseFloat(amount.replace(",", "."));
          if (isNaN(a)) return;
          addSaving(userId, a, date, note.trim() || null);
          setAmount("");
          setNote("");
        }}
        className="flex flex-col gap-2 mb-4"
      >
        <div className="flex gap-2">
          <input
            inputMode="decimal"
            placeholder="Betrag €"
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
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Notiz (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-12 flex-1 rounded border border-border bg-panel-raised px-3 text-sm text-ink outline-none focus:border-amber"
          />
          <button type="submit" className="h-12 px-5 rounded-md bg-amber text-bg text-sm font-semibold">
            +
          </button>
        </div>
      </form>

      <ul className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
        {sorted.map((e) => (
          <li key={e.id} className="flex items-center justify-between text-sm">
            <span className="text-ink-dim">{e.entry_date}{e.note ? ` · ${e.note}` : ""}</span>
            <div className="flex items-center gap-2">
              <span className="text-ink">{Number(e.amount).toFixed(2)} €</span>
              <button type="button" onClick={() => deleteSaving(e.id)} className="text-ink-dim">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
