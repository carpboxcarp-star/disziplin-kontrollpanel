"use client";

import { useState } from "react";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import { updateSettings } from "@/lib/actions/settings";
import type { Settings } from "@/lib/types";

export function PinSettings({ userId, settings }: { userId: string; settings: Settings | null }) {
  const [pin, setPin] = useState(settings?.unlock_pin ?? "1234");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(value: string) {
    setError(null);
    if (!/^\d{4}$/.test(value)) {
      setError("PIN muss genau 4 Ziffern haben.");
      return;
    }
    const { error: err } = await updateSettings(userId, { unlock_pin: value });
    if (err) {
      setError("Speichern fehlgeschlagen.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <Panel>
      <PanelTitle>Entsperr-PIN</PanelTitle>
      <p className="text-xs text-ink-dim mb-3">
        Wird abgefragt, um einen bereits abgeschlossenen Tag nachträglich zu bearbeiten.
      </p>
      <div className="flex items-center gap-2">
        <input
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onBlur={() => save(pin)}
          className="h-12 w-24 rounded border border-border bg-panel-raised px-3 text-center text-lg tracking-[0.3em] text-ink outline-none focus:border-amber"
        />
        {saved && <span className="text-xs text-amber">Gespeichert</span>}
      </div>
      {error && <p className="text-xs text-status-missed mt-2">{error}</p>}
    </Panel>
  );
}
