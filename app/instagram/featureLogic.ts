import type { MediaItem, AutoBoxReason } from "./mediaTypes";

export interface AutoBoxResult {
  item: MediaItem | null;
  reason: AutoBoxReason;
  label: string;
  description: string;
}

/** Minimal fallback implementation used by DashboardFeatureCard until full logic is available. */
export function getAutoBoxResult(
  items: MediaItem[],
  now: Date = new Date(),
): AutoBoxResult {
  if (!items || items.length === 0) {
    return {
      item: null,
      reason: "fallback",
      label: "No Feature",
      description: "No media available",
    };
  }

  const pinned = items.find((i) => i.pinnedForFeature);
  const chosen = pinned ?? items[0];

  return {
    item: chosen,
    reason: pinned ? "pinned" : "fallback",
    label: pinned ? "Pinned Feature" : "Random Memory",
    description: "Lightweight auto-box fallback.",
  };
}

export default getAutoBoxResult;
