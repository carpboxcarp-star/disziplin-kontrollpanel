import type { Settings, WeekdaySchedule } from "@/lib/types";
import { minutesToTimeStr, timeStrToMinutes } from "@/lib/utils/date";

/**
 * Empfohlene Schlafenszeit für HEUTE NACHT, berechnet aus dem morgigen Schultag:
 * Beginn erste Stunde − Anfahrt − Aufstehpuffer − Zielschlafdauer.
 * Gibt null zurück, wenn für morgen keine erste Stunde hinterlegt ist (z.B. Wochenende).
 */
export function computeRecommendedBedtime(
  tomorrowSchedule: WeekdaySchedule | undefined,
  settings: Settings | undefined,
): string | null {
  if (!tomorrowSchedule?.first_lesson_time || !settings) return null;

  const wakeBuffer = settings.wake_buffer_minutes;
  const sleepMinutes = Math.round(settings.target_sleep_hours * 60);
  const commute = tomorrowSchedule.commute_minutes ?? 0;

  const lessonStart = timeStrToMinutes(tomorrowSchedule.first_lesson_time.slice(0, 5));
  const wakeUp = lessonStart - commute - wakeBuffer;
  const bedtime = wakeUp - sleepMinutes;

  return minutesToTimeStr(bedtime);
}

export function computeSleepDuration(sleepStart: string | null, wakeTime: string | null): string | null {
  if (!sleepStart || !wakeTime) return null;
  const start = new Date(sleepStart).getTime();
  const end = new Date(wakeTime).getTime();
  let diffMinutes = Math.round((end - start) / 60000);
  if (diffMinutes < 0) diffMinutes += 24 * 60;
  const h = Math.floor(diffMinutes / 60);
  const m = diffMinutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}
