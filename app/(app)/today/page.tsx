"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { ensureDailyLog } from "@/lib/actions/today";
import { todayStr, formatDateLong } from "@/lib/utils/date";
import { HabitList } from "@/components/today/HabitList";
import { SleepButtons } from "@/components/today/SleepButtons";
import { RecommendedBedtime } from "@/components/today/RecommendedBedtime";
import { CloseDayButton } from "@/components/today/CloseDayButton";
import { PanelTitle } from "@/components/ui/Panel";

export default function TodayPage() {
  const { ready, habitDefinitions, dailyLogs, habitEntries, weekdaySchedule, settings } =
    useDashboard();
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    const init = () => {
      const d = todayStr();
      setDate(d);
      ensureDailyLog(d);
    };
    init();
  }, []);

  if (!ready || !date) {
    return <p className="text-ink-dim text-sm p-4">Lade...</p>;
  }

  const dailyLog = dailyLogs.find((l) => l.log_date === date) ?? null;
  const todayEntries = dailyLog
    ? habitEntries.filter((e) => e.daily_log_id === dailyLog.id)
    : [];
  const coreAndBonusDefs = habitDefinitions.filter(
    (d) => d.active && d.key !== "business_outreach",
  );
  const locked = dailyLog?.locked ?? false;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-dim">{formatDateLong(date)}</p>

      <RecommendedBedtime today={date} schedule={weekdaySchedule} settings={settings} />

      <div>
        <PanelTitle>Habits</PanelTitle>
        <HabitList
          definitions={coreAndBonusDefs}
          entries={todayEntries}
          date={date}
          locked={locked}
        />
      </div>

      <SleepButtons dailyLog={dailyLog} locked={locked} />

      <CloseDayButton
        date={date}
        locked={locked}
        definitions={coreAndBonusDefs}
        entries={todayEntries}
      />
    </div>
  );
}
