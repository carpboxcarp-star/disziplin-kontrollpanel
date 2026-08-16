"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/context/DashboardContext";
import { CalendarStrip } from "@/components/history/CalendarStrip";
import { MilestoneList } from "@/components/history/MilestoneList";
import { DayDetail } from "@/components/history/DayDetail";

export default function HistoryPage() {
  const { ready, userId, dailyLogs, habitEntries, habitDefinitions, milestones, userStats } =
    useDashboard();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (!ready || !userId) {
    return <p className="text-ink-dim text-sm p-4">Lade...</p>;
  }

  const editableDefs = habitDefinitions.filter((d) => d.active && d.key !== "business_outreach");
  const selectedLog = selectedDate ? dailyLogs.find((l) => l.log_date === selectedDate) ?? null : null;
  const selectedEntries = selectedLog
    ? habitEntries.filter((e) => e.daily_log_id === selectedLog.id)
    : [];

  return (
    <div className="flex flex-col gap-5">
      <CalendarStrip
        dailyLogs={dailyLogs}
        habitEntries={habitEntries}
        habitDefinitions={habitDefinitions}
        onSelectDate={setSelectedDate}
      />
      <MilestoneList
        userId={userId}
        milestones={milestones}
        currentStreak={userStats?.current_streak ?? 0}
      />

      {selectedDate && (
        <DayDetail
          date={selectedDate}
          dailyLog={selectedLog}
          definitions={editableDefs}
          entries={selectedEntries}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
