"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ExerciseDefinition } from "@/lib/types";

/** Statischer, globaler Push/Pull/Legs-Plan — kein user_id-Filter, kein Realtime nötig. */
export function useExerciseDefinitions() {
  const [definitions, setDefinitions] = useState<ExerciseDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("exercise_definitions")
      .select("*")
      .order("split_day", { ascending: true })
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setDefinitions((data as ExerciseDefinition[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { definitions, loading };
}
