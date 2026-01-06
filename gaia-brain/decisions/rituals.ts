// /gaia-brain/decisions/rituals.ts

import { BrainContext } from "../types";

export function decideRitualGate(context: BrainContext) {
  const { now, health } = context;

  const today = now.toDateString();
  const lastDone = health?.lastRitualDate;

  if (lastDone === today) {
    return {
      allowed: false,
      reason: "ALREADY_DONE",
    };
  }

  return {
    allowed: true,
    reason: "OK",
  };
}
