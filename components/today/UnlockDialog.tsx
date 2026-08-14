"use client";

import { useState } from "react";
import { unlockDay } from "@/lib/actions/today";

export function UnlockDialog({ date, onClose }: { date: string; onClose: () => void }) {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (pin.length !== 4) return;
    setStatus("checking");
    setError(null);
    const { error: err } = await unlockDay(date, pin);
    if (err) {
      setError(
        err.message?.toLowerCase().includes("pin")
          ? "Falsche PIN — bitte erneut versuchen."
          : "Entsperren fehlgeschlagen.",
      );
      setStatus("error");
      setPin("");
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xs rounded-lg border border-border bg-panel p-6">
        <p className="text-sm text-ink mb-1">🔒 Tag entsperren</p>
        <p className="text-xs text-ink-dim mb-4">PIN eingeben, um Änderungen zuzulassen.</p>

        <input
          autoFocus
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            setPin(v);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          className="w-full h-14 rounded-md border border-border bg-panel-raised px-4 text-center text-2xl tracking-[0.5em] text-ink outline-none focus:border-amber mb-3"
          placeholder="••••"
        />

        {error && <p className="text-xs text-status-missed mb-3">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-md border border-border text-sm text-ink-dim"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pin.length !== 4 || status === "checking"}
            className="flex-1 h-12 rounded-md bg-amber text-bg text-sm font-semibold disabled:opacity-50"
          >
            {status === "checking" ? "Prüfe..." : "Entsperren"}
          </button>
        </div>
      </div>
    </div>
  );
}
