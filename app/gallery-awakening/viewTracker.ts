"use client";

import {
  readJSON,
  subscribe as subscribeToUserStorage,
  writeJSON,
} from "@/lib/user-storage";

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

export function readViewStore(): ViewStore {
  return readJSON<ViewStore>(STORAGE_KEY, {});
}

export function getViewEntry(itemId: string): ViewEntry | null {
  if (!itemId) return null;
  const store = readViewStore();
  return store[itemId] ?? null;
}

export function formatViewDuration(entry: ViewEntry | null): string {
  if (!entry || !Number.isFinite(entry.value) || entry.value <= 0) {
    return "Not watched yet";
  }
  const value = Math.max(0, Math.floor(entry.value));
  const unitLabel =
    entry.unit === "hours"
      ? "hr"
      : entry.unit === "minutes"
        ? "min"
        : "sec";
  const plural = value === 1 ? "" : "s";
  return `${value} ${unitLabel}${plural}`;
}

export function onViewStoreChange(
  listener: (store: ViewStore) => void
): () => void {
  const update = () => listener(readViewStore());
  // Run once so consumers have initial data.
  update();
  return subscribeToUserStorage(({ key }) => {
    if (key !== STORAGE_KEY) return;
    update();
  });
}

export type { ViewEntry, ViewStore };
