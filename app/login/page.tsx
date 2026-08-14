"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-panel p-8">
        <h1 className="font-display text-4xl text-amber tracking-tight mb-1">
          DISZIPLIN
        </h1>
        <p className="text-ink-dim text-sm mb-8">Kontrollpanel — Login per Magic Link</p>

        {status === "sent" ? (
          <p className="text-ink text-sm leading-relaxed">
            Link gesendet an <span className="text-amber">{email}</span>. E-Mail-Postfach
            öffnen und auf den Link tippen, um dieses Gerät einzuloggen.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              autoFocus
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-md border border-border bg-panel-raised px-4 text-base text-ink placeholder:text-ink-dim outline-none focus:border-amber"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="h-14 rounded-md bg-amber text-bg font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition"
            >
              {status === "sending" ? "Sende Link..." : "Magic Link senden"}
            </button>
            {error && <p className="text-status-missed text-sm">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
