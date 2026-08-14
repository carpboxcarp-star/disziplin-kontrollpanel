"use client";

import { useRef } from "react";

/**
 * Sanfter, ansteigender Wecker-Ton über die Web Audio API (kein aggressiver Alarm).
 * Der AudioContext wird bereits beim Betreten des Standby-Modus (also durch eine echte
 * Nutzerinteraktion, "Schlafen gehen") angelegt, damit Browser-Autoplay-Regeln den
 * späteren, unbeaufsichtigten Alarm-Start nicht blockieren.
 */
export function useAlarmSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  function unlock() {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
  }

  function playChime() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 2.8);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 1.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 3.3);
  }

  function start() {
    unlock();
    playChime();
    intervalRef.current = window.setInterval(playChime, 4200);
  }

  function stop() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }

  return { unlock, start, stop };
}
