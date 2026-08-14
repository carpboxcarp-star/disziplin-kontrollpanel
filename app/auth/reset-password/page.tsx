"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }

    setStatus("done");
    setTimeout(() => {
      router.push("/today");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-panel p-8">
        <h1 className="font-display text-4xl text-amber tracking-tight mb-1">DISZIPLIN</h1>
        <p className="text-ink-dim text-sm mb-8">Neues Passwort vergeben</p>

        {status === "done" ? (
          <p className="text-ink text-sm">
            Passwort gespeichert. Du wirst weitergeleitet...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              required
              autoFocus
              placeholder="Neues Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-md border border-border bg-panel-raised px-4 text-base text-ink placeholder:text-ink-dim outline-none focus:border-amber"
            />
            <input
              type="password"
              required
              placeholder="Passwort bestätigen"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-14 rounded-md border border-border bg-panel-raised px-4 text-base text-ink placeholder:text-ink-dim outline-none focus:border-amber"
            />
            <button
              type="submit"
              disabled={status === "saving"}
              className="h-14 rounded-md bg-amber text-bg font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition"
            >
              {status === "saving" ? "Speichere..." : "Passwort speichern"}
            </button>
            {error && <p className="text-status-missed text-sm">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
