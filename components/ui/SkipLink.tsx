"use client";

import { useState } from "react";

interface SkipLinkProps {
  skipped: boolean;
  note: string | null;
  onSkip: (note: string) => void;
  onUnskip: () => void;
}

export function SkipLink({ skipped, note, onSkip, onUnskip }: SkipLinkProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  if (skipped) {
    return (
      <button
        type="button"
        onClick={onUnskip}
        title={note ?? undefined}
        className="text-xs text-ink-dim underline decoration-dotted underline-offset-2"
      >
        geskippt{note ? ` · ${note}` : ""}
      </button>
    );
  }

  if (open) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSkip(draft.trim());
          setOpen(false);
          setDraft("");
        }}
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Notiz (z.B. im Urlaub)"
          className="h-9 w-40 rounded border border-border bg-panel px-2 text-xs text-ink outline-none focus:border-amber"
        />
        <button type="submit" className="text-xs text-amber">
          OK
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-dim"
        >
          ✕
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setOpen(true);
      }}
      className="text-xs text-ink-dim/70 hover:text-ink-dim"
    >
      skip
    </button>
  );
}
