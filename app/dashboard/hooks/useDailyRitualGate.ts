// app/dashboard/hooks/useDailyRitualGate.ts
"use client";

import { useEffect, useState } from "react";
import { readJSON, subscribe, waitForUserStorage } from "@/lib/user-storage";
import { todayKey } from "@/utils/dates";

const DAILY_RITUAL_KEY = "gaia.gate.dailyRitual";

type DailyGateState = {
  date?: string;
  completedAt?: string;
};

export function useDailyRitualGate() {
  const [today, setToday] = useState<string>(() => todayKey());
  const [completedToday, setCompletedToday] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const evaluate = () => {
      try {
        const stored = readJSON<DailyGateState | null>(DAILY_RITUAL_KEY, null);
        if (cancelled) return;
        const done = !!stored?.date && stored.date === today;
        setCompletedToday(done);
      } catch {
        if (!cancelled) setCompletedToday(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    (async () => {
      try {
        await waitForUserStorage();
      } catch {
        // ignore
      } finally {
        evaluate();
      }
    })();

    const unsubscribe = subscribe((detail) => {
      if (!detail.key || detail.key !== DAILY_RITUAL_KEY) return;
      evaluate();
    });

    const interval = setInterval(() => {
      setToday(todayKey());
    }, 60 * 60 * 1000);

    return () => {
      cancelled = true;
      unsubscribe();
      clearInterval(interval);
    };
  }, [today]);

  return { today, completedToday, ready };
}
