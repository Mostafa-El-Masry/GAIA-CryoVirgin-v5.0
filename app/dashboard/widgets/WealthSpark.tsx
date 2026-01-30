"use client";

import { useEffect, useState } from "react";

import { readJSON, waitForUserStorage } from "@/lib/user-storage";

import Sparkline from "./Sparkline";

/**
 * Wealth sparkline: looks for wealth_history = [number,…] or similar.
 */
export default function WealthSpark() {
  const [points, setPoints] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await waitForUserStorage();
      if (cancelled) return;
      let arr: number[] = [];
      const cand =
        readJSON<any[]>("wealth_history", []) ??
        readJSON<any[]>("wealth_balances", []);
      if (Array.isArray(cand)) {
        arr = cand
          .map((x: any) => Number(x?.total ?? x))
          .filter((n: any) => !isNaN(n));
      }
      if (arr.length === 0) {
        arr = [0, 2, 4, 7, 11, 16, 22, 29].map((n) => n * 1000);
      }
      setPoints(arr.slice(-30));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <Sparkline points={points} />;
}
