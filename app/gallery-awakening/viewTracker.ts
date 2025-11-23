"use client";

import { readJSON, writeJSON } from "@/lib/user-storage";

type ViewUnit = "seconds" | "minutes" | "hours";

type ViewEntry = {
  totalSeconds: number;
  unit: ViewUnit;
  value: number;
  updatedAt: string;
};

type ViewStore = Record<string, ViewEntry>;

const STORAGE_KEY = "gaia.gallery.viewtime";

function computeUnit(totalSeconds: number): { unit: ViewUnit; value: number } {
  if (totalSeconds < 60) {
    return { unit: "seconds", value: Math.floor(totalSeconds) };
  }
  if (totalSeconds < 3600) {
    return { unit: "minutes", value: Math.floor(totalSeconds / 60) };
  }
  return { unit: "hours", value: Math.floor(totalSeconds / 3600) };
}

export function recordViewDuration(itemId: string, deltaSeconds: number) {
  if (!itemId || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return;

  const store = readJSON<ViewStore>(STORAGE_KEY, {});
  const prev = store[itemId];
  const nextTotal = Math.max(0, (prev?.totalSeconds ?? 0) + deltaSeconds);
  const { unit, value } = computeUnit(nextTotal);

  store[itemId] = {
    totalSeconds: nextTotal,
    unit,
    value,
    updatedAt: new Date().toISOString(),
  };

  writeJSON(STORAGE_KEY, store);
}
