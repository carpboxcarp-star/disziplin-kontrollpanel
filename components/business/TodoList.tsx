"use client";

import { useState } from "react";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import { addTodo, completeTodo, reopenTodo, deleteTodo } from "@/lib/actions/business";
import { todayStr, formatDateLong } from "@/lib/utils/date";
import type { Todo } from "@/lib/types";

export function TodoList({ userId, todos }: { userId: string; todos: Todo[] }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const open = todos.filter((t) => t.status === "open");
  const done = todos.filter((t) => t.status === "done");

  async function handleAction<T>(label: string, promise: PromiseLike<{ error: T | null }>) {
    setError(null);
    const { error: err } = await promise;
    if (err) {
      console.error(`${label} fehlgeschlagen:`, err);
      setError(`${label} fehlgeschlagen — bitte erneut versuchen.`);
    }
  }

  return (
    <Panel>
      <PanelTitle>To-dos</PanelTitle>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          handleAction("Hinzufügen", addTodo(userId, title.trim(), dueDate || null));
          setTitle("");
          setDueDate("");
        }}
        className="flex flex-col gap-2 mb-4"
      >
        <input
          placeholder="Neues To-do..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 rounded border border-border bg-panel-raised px-3 text-sm text-ink outline-none focus:border-amber"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dueDate}
            min={todayStr()}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-12 flex-1 rounded border border-border bg-panel-raised px-3 text-sm text-ink outline-none focus:border-amber"
          />
          <button type="submit" className="h-12 px-5 rounded-md bg-amber text-bg text-sm font-semibold">
            +
          </button>
        </div>
      </form>

      {error && <p className="text-xs text-status-missed mb-3">{error}</p>}

      <ul className="flex flex-col gap-2">
        {open.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 rounded-md border border-border bg-panel-raised px-3 py-2.5"
          >
            <button
              type="button"
              onClick={() => handleAction("Erledigt markieren", completeTodo(t.id))}
              aria-label="Als erledigt markieren"
              className="h-12 w-12 shrink-0 rounded-md border border-border flex items-center justify-center text-lg text-ink-dim active:border-amber active:text-amber active:bg-amber/10 transition"
            >
              ✓
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink truncate">{t.title}</p>
              {t.due_date && (
                <p className="text-xs text-ink-dim">Frist: {formatDateLong(t.due_date)}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleAction("Löschen", deleteTodo(t.id))}
              aria-label="Löschen"
              className="h-12 w-12 shrink-0 flex items-center justify-center text-ink-dim text-lg"
            >
              ✕
            </button>
          </li>
        ))}
        {open.length === 0 && <p className="text-sm text-ink-dim">Keine offenen To-dos.</p>}
      </ul>

      {done.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-ink-dim cursor-pointer py-2">
            Erledigt ({done.length})
          </summary>
          <ul className="flex flex-col gap-2 mt-2">
            {done.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => handleAction("Wieder öffnen", reopenTodo(t.id))}
                  aria-label="Wieder öffnen"
                  className="h-10 w-10 shrink-0 rounded-md border border-amber bg-amber/10 text-amber text-sm flex items-center justify-center"
                >
                  ✓
                </button>
                <span className="flex-1 text-sm text-ink-dim line-through truncate">{t.title}</span>
                {t.bonus_awarded && <span className="text-xs text-amber shrink-0">Bonus</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </Panel>
  );
}
