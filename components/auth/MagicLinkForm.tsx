"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function MagicLinkForm() {
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

  if (status === "sent") {
    return (
      <p className="text-ink text-sm leading-relaxed">
        Link gesendet an <span className="text-amber">{email}</span>. E-Mail-Postfach öffnen
        und auf den Link tippen, um dieses Gerät einzuloggen.
      </p>
    );
  }

  return (
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
  );
}
