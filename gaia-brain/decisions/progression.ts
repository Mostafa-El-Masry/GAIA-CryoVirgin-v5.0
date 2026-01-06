// /gaia-brain/decisions/progression.ts

import { BrainContext } from "../types";

export function decideProgression(context: BrainContext) {
  const { user, timeline, flags } = context;

  if (!user) {
    return {
      allowed: false,
      reason: "NO_USER",
    };
  }

  if (flags.isLocked) {
    return {
      allowed: false,
      reason: "SYSTEM_LOCK",
    };
  }

  if (timeline.phase < 1) {
    return {
      allowed: false,
      reason: "PHASE_TOO_EARLY",
    };
  }

  return {
    allowed: true,
    reason: "OK",
  };
}
