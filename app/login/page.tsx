"use client";

import { useState } from "react";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { PasswordForm } from "@/components/auth/PasswordForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

const TABS = [
  { key: "magic", label: "Magic Link" },
  { key: "password", label: "Login" },
  { key: "signup", label: "Registrieren" },
] as const;

type Mode = (typeof TABS)[number]["key"];

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("magic");

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-panel p-8">
        <h1 className="font-display text-4xl text-amber tracking-tight mb-1">DISZIPLIN</h1>
        <p className="text-ink-dim text-sm mb-6">Kontrollpanel — Login</p>

        <div className="flex rounded-md border border-border overflow-hidden mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              className={`flex-1 min-h-[44px] text-xs sm:text-sm font-medium transition px-1 ${
                mode === tab.key ? "bg-amber text-bg" : "bg-panel-raised text-ink-dim"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mode === "magic" && <MagicLinkForm />}
        {mode === "password" && <PasswordForm />}
        {mode === "signup" && <SignUpForm />}
      </div>
    </div>
  );
}
