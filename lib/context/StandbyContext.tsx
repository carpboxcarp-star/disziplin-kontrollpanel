"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAlarmSound } from "@/lib/hooks/useAlarmSound";

type StandbyPhase = "off" | "black" | "alarm";

interface StandbyData {
  phase: StandbyPhase;
  alarmTime: string | null;
  enterStandby: () => void;
  exitStandby: () => void;
  setAlarmTime: (time: string | null) => void;
}

const StandbyContext = createContext<StandbyData | null>(null);

const ALARM_STORAGE_KEY = "disziplin-alarm-time";

export function StandbyProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<StandbyPhase>("off");
  const [alarmTime, setAlarmTimeState] = useState<string | null>(null);
  const alarm = useAlarmSound();
  const firedForRef = useRef<string | null>(null);

  useEffect(() => {
    const load = () => {
      const stored = window.localStorage.getItem(ALARM_STORAGE_KEY);
      if (stored) setAlarmTimeState(stored);
    };
    load();
  }, []);

  const setAlarmTime = useCallback((time: string | null) => {
    setAlarmTimeState(time);
    firedForRef.current = null;
    if (time) window.localStorage.setItem(ALARM_STORAGE_KEY, time);
    else window.localStorage.removeItem(ALARM_STORAGE_KEY);
  }, []);

  const enterStandby = useCallback(() => {
    alarm.unlock();
    firedForRef.current = null;
    setPhase("black");
  }, [alarm]);

  const exitStandby = useCallback(() => {
    alarm.stop();
    setPhase("off");
  }, [alarm]);

  // Prüft im Standby-Modus jede Sekunde, ob die eingestellte Weckzeit erreicht ist.
  useEffect(() => {
    if (phase !== "black" || !alarmTime) return;

    const id = window.setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      if (hhmm === alarmTime && firedForRef.current !== hhmm) {
        firedForRef.current = hhmm;
        setPhase("alarm");
        alarm.start();
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase, alarmTime, alarm]);

  return (
    <StandbyContext.Provider value={{ phase, alarmTime, enterStandby, exitStandby, setAlarmTime }}>
      {children}
    </StandbyContext.Provider>
  );
}

export function useStandby() {
  const ctx = useContext(StandbyContext);
  if (!ctx) throw new Error("useStandby must be used within StandbyProvider");
  return ctx;
}
