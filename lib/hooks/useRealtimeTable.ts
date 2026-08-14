"use client";

import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface Options {
  orderBy?: string;
  ascending?: boolean;
  idKey?: string;
}

function fieldOf(row: unknown, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

/**
 * Lädt alle Zeilen einer user-scoped Tabelle und hält sie live über Supabase Realtime
 * synchron (INSERT/UPDATE/DELETE). Für dieses Ein-Nutzer-Kontrollpanel ist die Datenmenge
 * pro Tabelle klein genug, um sie komplett im Speicher zu halten statt zu paginieren.
 */
export function useRealtimeTable<T>(
  table: string,
  userId: string | null | undefined,
  options: Options = {},
) {
  const { orderBy, ascending = true, idKey = "id" } = options;
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();
    let query = supabase.from(table).select("*").eq("user_id", userId);
    if (orderBy) query = query.order(orderBy, { ascending });
    const { data, error } = await query;
    if (!error) setRows((data as T[]) ?? []);
    setLoading(false);
  }, [table, userId, orderBy, ascending]);

  useEffect(() => {
    if (!userId) {
      const reset = () => {
        setRows([]);
        setLoading(false);
      };
      reset();
      return;
    }

    let active = true;
    const start = () => {
      setLoading(true);
      refetch();
    };
    start();

    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel(`rt:${table}:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `user_id=eq.${userId}` },
        (payload) => {
          if (!active) return;
          setRows((current) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as T;
              if (current.some((r) => fieldOf(r, idKey) === fieldOf(row, idKey))) return current;
              return [...current, row];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as T;
              return current.map((r) => (fieldOf(r, idKey) === fieldOf(row, idKey) ? row : r));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as T;
              return current.filter((r) => fieldOf(r, idKey) !== fieldOf(row, idKey));
            }
            return current;
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, userId, idKey]);

  return { rows, loading, refetch, setRows };
}
