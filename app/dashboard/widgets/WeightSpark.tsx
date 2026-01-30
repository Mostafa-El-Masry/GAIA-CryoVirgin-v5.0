"use client";

import { useEffect, useState } from "react";

import { getItem, readJSON, waitForUserStorage } from "@/lib/user-storage";

import Sparkline from "./Sparkline";

/**
 * Weight sparkline. Looks for health_weight_history = [{date,kg}, …] or health_weights.
 */
export default function WeightSpark() {
  const [points, setPoints] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await waitForUserStorage();
      if (cancelled) return;
      let arr: number[] = [];
      const cand =
        readJSON<any[]>("health_weight_history", []) ??
        readJSON<any[]>("health_weights", []);
      if (Array.isArray(cand)) {
        arr = cand
          .map((x: any) => Number(x?.kg ?? x?.weight))
          .filter((n: any) => !isNaN(n));
      }
      if (arr.length === 0) {
        const latestRaw = getItem("health_weight_latest");
        const w = Number(latestRaw || 0);
        if (w) arr = [w - 1, w - 0.5, w, w + 0.2, w - 0.1];
      }
      setPoints(arr.slice(-30));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <Sparkline points={points} />;
}
