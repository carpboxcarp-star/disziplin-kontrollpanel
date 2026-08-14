"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { ensureDailyLog } from "@/lib/actions/today";
import { todayStr, formatDateLong } from "@/lib/utils/date";
import { StreakHero } from "@/components/today/StreakHero";
import { QuoteBanner } from "@/components/today/QuoteBanner";
import { BalanceBar } from "@/components/today/BalanceBar";
import { HabitGrid } from "@/components/today/HabitGrid";
import { SleepButtons } from "@/components/today/SleepButtons";
import { RecommendedBedtime } from "@/components/today/RecommendedBedtime";
import { WeekStrip } from "@/components/today/WeekStrip";
import { NextMilestone } from "@/components/today/NextMilestone";
import { CloseDayButton } from "@/components/today/CloseDayButton";
import { PanelTitle } from "@/components/ui/Panel";

export default function TodayPage() {
  const {
    ready,
    habitDefinitions,
    dailyLogs,
    habitEntries,
    weekdaySchedule,
    settings,
    balanceEntries,
    milestones,
    userStats,
  } = useDashboard();
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
  const currentStreak = userStats?.current_streak ?? 0;
  const totalPoints = userStats?.total_points ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <QuoteBanner date={date} />
      <BalanceBar entries={balanceEntries} />
      <StreakHero streak={currentStreak} points={totalPoints} />

      <p className="text-sm text-ink-dim">{formatDateLong(date)}</p>

      <div>
        <PanelTitle>Habits</PanelTitle>
        <HabitGrid
          definitions={coreAndBonusDefs}
          entries={todayEntries}
          date={date}
          locked={locked}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <SleepButtons dailyLog={dailyLog} locked={locked} />
        <RecommendedBedtime today={date} schedule={weekdaySchedule} settings={settings} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <WeekStrip
          today={date}
          dailyLogs={dailyLogs}
          habitEntries={habitEntries}
          habitDefinitions={habitDefinitions}
        />
        <NextMilestone milestones={milestones} currentStreak={currentStreak} />
      </div>

      <CloseDayButton
        date={date}
        locked={locked}
        definitions={coreAndBonusDefs}
        entries={todayEntries}
      />
    </div>
  );
}
