"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { SPLIT_LABELS, nextSplitDay, prevSplitDay } from "@/lib/utils/split";
import { setSplitDay } from "@/lib/actions/fitness";
import type { SplitDay } from "@/lib/types";

export function SplitDayCard({ splitDay }: { splitDay: SplitDay }) {
  const [pending, setPending] = useState(false);

  async function go(target: SplitDay) {
    setPending(true);
    const { error } = await setSplitDay(target);
    if (error) console.error("set_split_day fehlgeschlagen:", error);
    setPending(false);
  }

  return (
    <Panel raised>
      <p className="text-xs uppercase tracking-wider text-ink-dim mb-1">Heute dran</p>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => go(prevSplitDay(splitDay))}
          aria-label="Vorheriger Trainingstag"
          className="shrink-0 h-11 w-11 rounded-md border border-border text-ink-dim disabled:opacity-50 active:border-amber active:text-amber"
        >
          ←
        </button>
        <p className="font-display text-4xl text-amber text-center">{SPLIT_LABELS[splitDay]}</p>
        <button
          type="button"
          disabled={pending}
          onClick={() => go(nextSplitDay(splitDay))}
          aria-label="Nächster Trainingstag"
          className="shrink-0 h-11 w-11 rounded-md border border-border text-ink-dim disabled:opacity-50 active:border-amber active:text-amber"
        >
          →
        </button>
      </div>
    </Panel>
  );
}
