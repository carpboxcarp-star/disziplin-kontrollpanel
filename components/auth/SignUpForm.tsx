"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "signing-up" | "confirm-email" | "error">("idle");
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

    setStatus("signing-up");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }

    if (data.session) {
      router.push("/today");
      router.refresh();
      return;
    }

    setStatus("confirm-email");
  }

  if (status === "confirm-email") {
    return (
      <p className="text-ink text-sm leading-relaxed">
        Bestätigungslink gesendet an <span className="text-amber">{email}</span>. E-Mail-Postfach
        öffnen und den Account bestätigen, um dich einzuloggen.
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
      <input
        type="password"
        required
        placeholder="Passwort (mind. 8 Zeichen)"
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
        disabled={status === "signing-up"}
        className="h-14 rounded-md bg-amber text-bg font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition"
      >
        {status === "signing-up" ? "Erstelle Account..." : "Account erstellen"}
      </button>
      {error && <p className="text-status-missed text-sm">{error}</p>}
    </form>
  );
}
