import type { SplitDay, SplitRotationState } from "@/lib/types";

const ORDER: SplitDay[] = ["day1", "day2", "day3", "day4", "day5"];

export function nextSplitDay(split: SplitDay | null): SplitDay {
  if (!split) return "day1";
  const idx = ORDER.indexOf(split);
  return ORDER[(idx + 1) % ORDER.length];
}

export function prevSplitDay(split: SplitDay): SplitDay {
  const idx = ORDER.indexOf(split);
  return ORDER[(idx - 1 + ORDER.length) % ORDER.length];
}

/**
 * Aktueller Split-Tag: rotiert NICHT nach Kalendertag, sondern nach dem zuletzt
 * abgeschlossenen Trainingstag (Tag1→Tag2→...→Tag5→Tag1...), damit Ruhetage die Rotation
 * nicht verschieben. Wurde heute bereits trainiert, bleibt der heutige Split-Tag stehen.
 */
export function currentSplitDay(state: SplitRotationState | undefined, todayStr: string): SplitDay {
  if (!state?.last_completed_split) return "day1";
  if (state.last_completed_date === todayStr) return state.last_completed_split;
  return nextSplitDay(state.last_completed_split);
}

export const SPLIT_LABELS: Record<SplitDay, string> = {
  day1: "Tag 1 — Brust & Trizeps",
  day2: "Tag 2 — Rücken & Bizeps",
  day3: "Tag 3 — Schultern & Nacken",
  day4: "Tag 4 — Brust & Bizeps",
  day5: "Tag 5 — Rücken & Trizeps",
};
