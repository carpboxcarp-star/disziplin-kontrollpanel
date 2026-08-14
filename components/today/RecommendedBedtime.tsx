import { Panel, PanelTitle } from "@/components/ui/Panel";
import { computeRecommendedBedtime } from "@/lib/utils/sleep";
import { addDaysStr, weekdayOf } from "@/lib/utils/date";
import type { Settings, WeekdaySchedule } from "@/lib/types";

export function RecommendedBedtime({
  today,
  schedule,
  settings,
}: {
  today: string;
  schedule: WeekdaySchedule[];
  settings: Settings | null;
}) {
  const tomorrow = addDaysStr(today, 1);
  const tomorrowWeekday = weekdayOf(tomorrow);
  const tomorrowSchedule = schedule.find((s) => s.weekday === tomorrowWeekday);
  const bedtime = computeRecommendedBedtime(tomorrowSchedule, settings ?? undefined);

  return (
    <Panel raised>
      <PanelTitle>Empfohlene Schlafenszeit heute</PanelTitle>
      {bedtime ? (
        <span className="font-display text-4xl text-amber">{bedtime}</span>
      ) : (
        <span className="text-sm text-ink-dim">
          Keine erste Stunde für morgen hinterlegt — siehe Einstellungen.
        </span>
      )}
    </Panel>
  );
}
