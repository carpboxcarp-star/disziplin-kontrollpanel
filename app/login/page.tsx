"use client";

import { useState } from "react";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { PasswordForm } from "@/components/auth/PasswordForm";

export default function LoginPage() {
  const [mode, setMode] = useState<"magic" | "password">("magic");

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-panel p-8">
        <h1 className="font-display text-4xl text-amber tracking-tight mb-1">DISZIPLIN</h1>
        <p className="text-ink-dim text-sm mb-6">Kontrollpanel — Login</p>

        <div className="flex rounded-md border border-border overflow-hidden mb-6">
          <button
            type="button"
            onClick={() => setMode("magic")}
            className={`flex-1 min-h-[44px] text-sm font-medium transition ${
              mode === "magic" ? "bg-amber text-bg" : "bg-panel-raised text-ink-dim"
            }`}
          >
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`flex-1 min-h-[44px] text-sm font-medium transition ${
              mode === "password" ? "bg-amber text-bg" : "bg-panel-raised text-ink-dim"
            }`}
          >
            Email &amp; Passwort
          </button>
        </div>

        {mode === "magic" ? <MagicLinkForm /> : <PasswordForm />}
      </div>
    </div>
  );
}
