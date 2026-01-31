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
const UNITS = { seconds: 60, minutes: 3600 } as const;

/**
 * Determine the best unit and value for displaying view duration.
 * Automatically converts seconds to minutes or hours as appropriate.
 */
function computeUnit(totalSeconds: number): { unit: ViewUnit; value: number } {
  if (totalSeconds < UNITS.seconds) {
    return { unit: "seconds", value: Math.floor(totalSeconds) };
  }
  if (totalSeconds < UNITS.minutes) {
    return { unit: "minutes", value: Math.floor(totalSeconds / 60) };
  }
  return { unit: "hours", value: Math.floor(totalSeconds / 3600) };
}

/**
 * Record or update view duration for a media item.
 * Accumulates total seconds watched and automatically converts to appropriate unit.
 */
export function recordViewDuration(itemId: string, deltaSeconds: number): void {
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

/**
 * Get the entire view duration store.
 */
export function readViewStore(): ViewStore {
  return readJSON<ViewStore>(STORAGE_KEY, {});
}

/**
 * Get the view entry for a specific media item.
 */
export function getViewEntry(itemId: string): ViewEntry | null {
  if (!itemId) return null;
  const store = readViewStore();
  return store[itemId] ?? null;
}

/**
 * Format a view entry for human-readable display.
 * Returns "Not watched yet" if no entry or zero value.
 */
export function formatViewDuration(entry: ViewEntry | null): string {
  if (!entry || !Number.isFinite(entry.value) || entry.value <= 0) {
    return "Not watched yet";
  }
  const value = Math.max(0, Math.floor(entry.value));
  const unitLabels = { hours: "hr", minutes: "min", seconds: "sec" } as const;
  const unitLabel = unitLabels[entry.unit];
  const plural = value === 1 ? "" : "s";
  return `${value} ${unitLabel}${plural}`;
}

/**
 * Subscribe to view store changes. Listener is called immediately with current data.
 * Returns unsubscribe function.
 */
export function onViewStoreChange(
  listener: (store: ViewStore) => void,
): () => void {
  const update = () => listener(readViewStore());
  update(); // Run once for initial data
  return subscribeToUserStorage(({ key }) => {
    if (key === STORAGE_KEY) update();
  });
}

export type { ViewEntry, ViewStore };
