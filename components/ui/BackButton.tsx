"use client";

import { useRouter } from "next/navigation";

export function BackButton({ fallbackHref = "/today", label = "Zurück" }: { fallbackHref?: string; label?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className="flex items-center gap-1.5 min-h-[44px] px-2 -ml-2 text-sm text-ink-dim active:text-amber"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </button>
  );
}
