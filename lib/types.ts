export type HabitStatus = "done" | "skipped" | "missed";
export type SplitDay = "push" | "pull" | "legs";
export type SupplementType = "shake" | "riegel" | "custom" | "creatine";
export type TodoStatus = "open" | "done";

export interface HabitDefinition {
  id: string;
  user_id: string;
  key: string;
  label: string;
  points: number;
  is_core: boolean;
  is_bonus: boolean;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  sleep_start: string | null;
  wake_time: string | null;
  locked: boolean;
  locked_at: string | null;
  streak_after: number | null;
  points_after: number | null;
  streak_before: number | null;
  points_before: number | null;
  is_rest_day: boolean;
  created_at: string;
}

export interface HabitEntry {
  id: string;
  user_id: string;
  daily_log_id: string;
  habit_key: string;
  status: HabitStatus;
  skip_note: string | null;
  points_awarded: number;
  updated_at: string;
}

export interface UserStats {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  updated_at: string;
}

export interface WeekdaySchedule {
  user_id: string;
  weekday: number;
  first_lesson_time: string | null;
  commute_minutes: number;
}

export interface Settings {
  user_id: string;
  protein_goal_g: number;
  wake_buffer_minutes: number;
  target_sleep_hours: number;
  todo_bonus_points: number;
  gamble_savings_amount: number;
  last_auto_saving_date: string | null;
  unlock_pin: string;
  updated_at: string;
}

export interface ExerciseDefinition {
  id: string;
  split_day: SplitDay;
  name: string;
  sets_target: number;
  reps_target: string;
  sort_order: number;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  exercise_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
}

export interface ExerciseSet {
  id: string;
  user_id: string;
  exercise_log_id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
}

export interface SplitRotationState {
  user_id: string;
  last_completed_split: SplitDay | null;
  last_completed_date: string | null;
}

export interface SupplementLog {
  id: string;
  user_id: string;
  log_date: string;
  type: SupplementType;
  grams: number | null;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  due_date: string | null;
  status: TodoStatus;
  completed_at: string | null;
  bonus_awarded: boolean;
  created_at: string;
}

export interface SavingsEntry {
  id: string;
  user_id: string;
  amount: number;
  entry_date: string;
  note: string | null;
  created_at: string;
}

export interface BalanceEntry {
  id: string;
  user_id: string;
  amount: number;
  entry_date: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  name: string;
  target_streak: number;
  achieved_at: string | null;
  created_at: string;
}
