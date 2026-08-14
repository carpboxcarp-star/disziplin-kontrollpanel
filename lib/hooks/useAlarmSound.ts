"use client";

import { useRef } from "react";

/**
 * Wecker-Ton: spielt public/alarm.mp3 laut und wiederholt ab. Schlägt das Laden/Abspielen
 * der Datei fehl (z.B. Datei fehlt, Format nicht unterstützt), fällt der Hook automatisch
 * auf einen sanften, selbst erzeugten Sinuston über die Web Audio API zurück.
 *
 * Sowohl das <audio>-Element als auch der AudioContext werden bereits beim Betreten des
 * Standby-Modus (also durch eine echte Nutzerinteraktion, "Schlafen gehen") kurz angespielt
 * und wieder pausiert ("unlock"), damit Browser-Autoplay-Regeln den späteren, unbeaufsichtigten
 * Alarm-Start nicht blockieren.
 */
export function useAlarmSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioFailedRef = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const usingFallbackRef = useRef(false);

  function unlock() {
    if (!audioRef.current) {
      const audio = new Audio("/alarm.mp3");
      audio.loop = true;
      audio.volume = 1.0;
      audio.preload = "auto";
      audio.addEventListener("error", () => {
        audioFailedRef.current = true;
      });
      audioRef.current = audio;
    }
    const audio = audioRef.current;
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1.0;
      })
      .catch(() => {
        audioFailedRef.current = true;
        audio.volume = 1.0;
      });

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

  function startFallback() {
    usingFallbackRef.current = true;
    playChime();
    intervalRef.current = window.setInterval(playChime, 4200);
  }

  function start() {
    if (audioFailedRef.current || !audioRef.current) {
      startFallback();
      return;
    }

    usingFallbackRef.current = false;
    audioRef.current.currentTime = 0;
    audioRef.current.volume = 1.0;
    audioRef.current
      .play()
      .catch(() => {
        startFallback();
      });
  }

  function stop() {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    usingFallbackRef.current = false;
  }

  return { unlock, start, stop };
}
