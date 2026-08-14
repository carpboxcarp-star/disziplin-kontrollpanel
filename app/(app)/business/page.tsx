"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { ensureDailyLog } from "@/lib/actions/today";
import { todayStr } from "@/lib/utils/date";
import { HabitList } from "@/components/today/HabitList";
import { TodoList } from "@/components/business/TodoList";
import { PanelTitle } from "@/components/ui/Panel";

export default function BusinessPage() {
  const { ready, userId, habitDefinitions, dailyLogs, habitEntries, todos } = useDashboard();
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    const init = () => {
      const d = todayStr();
      setDate(d);
      ensureDailyLog(d);
    };
    init();
  }, []);

  if (!ready || !userId || !date) {
    return <p className="text-ink-dim text-sm p-4">Lade...</p>;
  }

  const dailyLog = dailyLogs.find((l) => l.log_date === date) ?? null;
  const entries = dailyLog ? habitEntries.filter((e) => e.daily_log_id === dailyLog.id) : [];
  const businessDef = habitDefinitions.filter((d) => d.key === "business_outreach" && d.active);
  const locked = dailyLog?.locked ?? false;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <PanelTitle>Tagesziel</PanelTitle>
        <HabitList definitions={businessDef} entries={entries} date={date} locked={locked} />
      </div>

      <TodoList userId={userId} todos={todos} />
    </div>
  );
}
