"use client";

import { useState } from "react";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import { addTodo, completeTodo, reopenTodo, deleteTodo } from "@/lib/actions/business";
import { todayStr, formatDateLong } from "@/lib/utils/date";
import type { Todo } from "@/lib/types";

export function TodoList({ userId, todos }: { userId: string; todos: Todo[] }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const open = todos.filter((t) => t.status === "open");
  const done = todos.filter((t) => t.status === "done");

  return (
    <Panel>
      <PanelTitle>To-dos</PanelTitle>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          addTodo(userId, title.trim(), dueDate || null);
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

      <ul className="flex flex-col gap-2">
        {open.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-panel-raised px-4 py-3">
            <button
              type="button"
              onClick={() => completeTodo(t.id)}
              className="h-7 w-7 shrink-0 rounded border border-border"
              aria-label="erledigt"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink truncate">{t.title}</p>
              {t.due_date && (
                <p className="text-xs text-ink-dim">Frist: {formatDateLong(t.due_date)}</p>
              )}
            </div>
            <button type="button" onClick={() => deleteTodo(t.id)} className="text-ink-dim text-sm">
              ✕
            </button>
          </li>
        ))}
        {open.length === 0 && <p className="text-sm text-ink-dim">Keine offenen To-dos.</p>}
      </ul>

      {done.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-ink-dim cursor-pointer">
            Erledigt ({done.length})
          </summary>
          <ul className="flex flex-col gap-2 mt-2">
            {done.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => reopenTodo(t.id)}
                  className="h-6 w-6 shrink-0 rounded border border-amber bg-amber/10 text-amber text-xs flex items-center justify-center"
                >
                  ✓
                </button>
                <span className="flex-1 text-sm text-ink-dim line-through truncate">{t.title}</span>
                {t.bonus_awarded && <span className="text-xs text-amber">Bonus</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </Panel>
  );
}
