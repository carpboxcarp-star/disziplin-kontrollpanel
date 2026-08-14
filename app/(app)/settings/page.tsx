"use client";

import { useDashboard } from "@/lib/context/DashboardContext";
import { SchedulePanel } from "@/components/settings/SchedulePanel";
import { PointsEditor } from "@/components/settings/PointsEditor";
import { LogoutButton } from "@/components/layout/LogoutButton";

export default function SettingsPage() {
  const { ready, userId, weekdaySchedule, settings, habitDefinitions } = useDashboard();

  if (!ready || !userId) {
    return <p className="text-ink-dim text-sm p-4">Lade...</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <SchedulePanel userId={userId} schedule={weekdaySchedule} settings={settings} />
      <PointsEditor userId={userId} definitions={habitDefinitions} settings={settings} />
      <div className="flex justify-center pt-2">
        <LogoutButton />
      </div>
    </div>
  );
}
