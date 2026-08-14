"use client";

import { useDashboard } from "@/lib/context/DashboardContext";
import { CalendarStrip } from "@/components/history/CalendarStrip";
import { MilestoneList } from "@/components/history/MilestoneList";

export default function HistoryPage() {
  const { ready, userId, dailyLogs, habitEntries, habitDefinitions, milestones, userStats } =
    useDashboard();

  if (!ready || !userId) {
    return <p className="text-ink-dim text-sm p-4">Lade...</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <CalendarStrip
        dailyLogs={dailyLogs}
        habitEntries={habitEntries}
        habitDefinitions={habitDefinitions}
      />
      <MilestoneList
        userId={userId}
        milestones={milestones}
        currentStreak={userStats?.current_streak ?? 0}
      />
    </div>
  );
}
