// app/dashboard/hooks/useDailyRitualGate.ts
"use client";

import { useEffect, useState } from "react";
import { todayKey } from "@/utils/dates";

// Simplified gate: no local storage, just mark ready immediately.
export function useDailyRitualGate() {
  const [today, setToday] = useState<string>(() => todayKey());
  const [completedToday, setCompletedToday] = useState<boolean>(true);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    setToday(todayKey());
    setCompletedToday(true);
    setReady(true);
  }, []);

  return { today, completedToday, ready };
}
