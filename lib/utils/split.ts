import type { SplitDay, SplitRotationState } from "@/lib/types";

const ORDER: SplitDay[] = ["push", "pull", "legs"];

export function nextSplitDay(split: SplitDay | null): SplitDay {
  if (!split) return "push";
  const idx = ORDER.indexOf(split);
  return ORDER[(idx + 1) % ORDER.length];
}

/**
 * Aktueller Split-Tag: rotiert NICHT nach Kalendertag, sondern nach dem zuletzt
 * abgeschlossenen Trainingstag (Push→Pull→Legs→...), damit Ruhetage die Rotation
 * nicht verschieben. Wurde heute bereits trainiert, bleibt der heutige Split-Tag stehen.
 */
export function currentSplitDay(state: SplitRotationState | undefined, todayStr: string): SplitDay {
  if (!state?.last_completed_split) return "push";
  if (state.last_completed_date === todayStr) return state.last_completed_split;
  return nextSplitDay(state.last_completed_split);
}

export const SPLIT_LABELS: Record<SplitDay, string> = {
  push: "Push (Brust/Schulter/Trizeps)",
  pull: "Pull (Rücken/Bizeps)",
  legs: "Legs (Beine)",
};
