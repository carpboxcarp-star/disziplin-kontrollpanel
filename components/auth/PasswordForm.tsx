"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "signing-in" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [forgotError, setForgotError] = useState<string | null>(null);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setStatus("signing-in");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }

    router.push("/today");
    router.refresh();
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setForgotStatus("sending");
    setForgotError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      setForgotError(error.message);
      setForgotStatus("error");
      return;
    }

    setForgotStatus("sent");
  }

  if (forgotOpen) {
    return (
      <div className="flex flex-col gap-4">
        {forgotStatus === "sent" ? (
          <p className="text-ink text-sm leading-relaxed">
            Link zum Zurücksetzen gesendet an <span className="text-amber">{email}</span>.
            E-Mail-Postfach öffnen und dem Link folgen, um ein neues Passwort zu vergeben.
          </p>
        ) : (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <p className="text-ink-dim text-sm">
              E-Mail-Adresse eingeben — wir senden dir einen Link zum Zurücksetzen des Passworts.
            </p>
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
              disabled={forgotStatus === "sending"}
              className="h-14 rounded-md bg-amber text-bg font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition"
            >
              {forgotStatus === "sending" ? "Sende Link..." : "Link zum Zurücksetzen senden"}
            </button>
            {forgotError && <p className="text-status-missed text-sm">{forgotError}</p>}
          </form>
        )}
        <button
          type="button"
          onClick={() => {
            setForgotOpen(false);
            setForgotStatus("idle");
            setForgotError(null);
          }}
          className="text-xs text-ink-dim self-start"
        >
          ← Zurück zum Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignIn} className="flex flex-col gap-4">
      <input
        type="email"
        required
        autoFocus
        placeholder="deine@email.de"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-14 rounded-md border border-border bg-panel-raised px-4 text-base text-ink placeholder:text-ink-dim outline-none focus:border-amber"
      />
      <input
        type="password"
        required
        placeholder="Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-14 rounded-md border border-border bg-panel-raised px-4 text-base text-ink placeholder:text-ink-dim outline-none focus:border-amber"
      />
      <button
        type="submit"
        disabled={status === "signing-in"}
        className="h-14 rounded-md bg-amber text-bg font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition"
      >
        {status === "signing-in" ? "Melde an..." : "Anmelden"}
      </button>
      {error && <p className="text-status-missed text-sm">{error}</p>}
      <button
        type="button"
        onClick={() => setForgotOpen(true)}
        className="text-xs text-ink-dim self-start"
      >
        Passwort vergessen?
      </button>
    </form>
  );
}
