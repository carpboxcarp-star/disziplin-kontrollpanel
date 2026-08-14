"use client";

import { useEffect } from "react";

/**
 * Zusätzliche Absicherung neben den Windows-Energieoptionen: hält den Bildschirm im
 * Kiosk-Betrieb wach, solange der Tab sichtbar ist (Screen Wake Lock API, wird nicht von
 * allen Browsern unterstützt — schlägt dann still fehl).
 */
export function useWakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;

    const request = async () => {
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        // Wake Lock nicht verfügbar (z.B. Akku-Sparmodus) — Windows-Energieoptionen greifen weiterhin.
      }
    };

    request();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") request();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      sentinel?.release().catch(() => {});
    };
  }, []);
}
