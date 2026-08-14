"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSession } from "@/lib/hooks/useSession";
import { useRealtimeTable } from "@/lib/hooks/useRealtimeTable";
import { useExerciseDefinitions } from "@/lib/hooks/useExerciseDefinitions";
import type {
  BalanceEntry,
  DailyLog,
  ExerciseLog,
  ExerciseSet,
  HabitDefinition,
  HabitEntry,
  Milestone,
  SavingsEntry,
  Settings,
  SplitRotationState,
  SupplementLog,
  Todo,
  UserStats,
  WeekdaySchedule,
} from "@/lib/types";

interface DashboardData {
  userId: string | null;
  ready: boolean;

  habitDefinitions: HabitDefinition[];
  dailyLogs: DailyLog[];
  habitEntries: HabitEntry[];
  userStats: UserStats | null;
  weekdaySchedule: WeekdaySchedule[];
  settings: Settings | null;
  splitRotation: SplitRotationState | null;
  exerciseDefinitions: ReturnType<typeof useExerciseDefinitions>["definitions"];
  exerciseLogs: ExerciseLog[];
  exerciseSets: ExerciseSet[];
  supplementLogs: SupplementLog[];
  todos: Todo[];
  savingsEntries: SavingsEntry[];
  balanceEntries: BalanceEntry[];
  milestones: Milestone[];
}

const DashboardContext = createContext<DashboardData | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const userId = user?.id ?? null;

  const { rows: habitDefinitions, loading: l1 } = useRealtimeTable<HabitDefinition>(
    "habit_definitions",
    userId,
    { orderBy: "sort_order" },
  );
  const { rows: dailyLogs, loading: l2 } = useRealtimeTable<DailyLog>("daily_logs", userId, {
    orderBy: "log_date",
  });
  const { rows: habitEntries, loading: l3 } = useRealtimeTable<HabitEntry>(
    "habit_entries",
    userId,
  );
  const { rows: userStatsRows, loading: l4 } = useRealtimeTable<UserStats>(
    "user_stats",
    userId,
    { idKey: "user_id" },
  );
  const { rows: weekdaySchedule, loading: l5 } = useRealtimeTable<WeekdaySchedule>(
    "weekday_schedule",
    userId,
    { idKey: "weekday" },
  );
  const { rows: settingsRows, loading: l6 } = useRealtimeTable<Settings>("settings", userId, {
    idKey: "user_id",
  });
  const { rows: splitRotationRows, loading: l7 } = useRealtimeTable<SplitRotationState>(
    "split_rotation_state",
    userId,
    { idKey: "user_id" },
  );
  const { definitions: exerciseDefinitions, loading: l8 } = useExerciseDefinitions();
  const { rows: exerciseLogs, loading: l9 } = useRealtimeTable<ExerciseLog>(
    "exercise_logs",
    userId,
    { orderBy: "log_date" },
  );
  const { rows: exerciseSets, loading: l10 } = useRealtimeTable<ExerciseSet>(
    "exercise_sets",
    userId,
  );
  const { rows: supplementLogs, loading: l11 } = useRealtimeTable<SupplementLog>(
    "supplement_logs",
    userId,
    { orderBy: "log_date" },
  );
  const { rows: todos, loading: l12 } = useRealtimeTable<Todo>("todos", userId, {
    orderBy: "due_date",
  });
  const { rows: savingsEntries, loading: l13 } = useRealtimeTable<SavingsEntry>(
    "savings_entries",
    userId,
    { orderBy: "entry_date" },
  );
  const { rows: balanceEntries, loading: l14 } = useRealtimeTable<BalanceEntry>(
    "balance_entries",
    userId,
    { orderBy: "entry_date" },
  );
  const { rows: milestones, loading: l15 } = useRealtimeTable<Milestone>("milestones", userId);

  const ready =
    !!userId &&
    ![l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13, l14, l15].some(Boolean);

  const value = useMemo<DashboardData>(
    () => ({
      userId,
      ready,
      habitDefinitions,
      dailyLogs,
      habitEntries,
      userStats: userStatsRows[0] ?? null,
      weekdaySchedule,
      settings: settingsRows[0] ?? null,
      splitRotation: splitRotationRows[0] ?? null,
      exerciseDefinitions,
      exerciseLogs,
      exerciseSets,
      supplementLogs,
      todos,
      savingsEntries,
      balanceEntries,
      milestones,
    }),
    [
      userId,
      ready,
      habitDefinitions,
      dailyLogs,
      habitEntries,
      userStatsRows,
      weekdaySchedule,
      settingsRows,
      splitRotationRows,
      exerciseDefinitions,
      exerciseLogs,
      exerciseSets,
      supplementLogs,
      todos,
      savingsEntries,
      balanceEntries,
      milestones,
    ],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
