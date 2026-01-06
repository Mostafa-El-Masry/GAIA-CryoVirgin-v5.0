// /gaia-brain/decisions/safety.ts

import { BrainContext } from "../types";

export function decideSafety(context: BrainContext) {
  const { user, flags } = context;

  if (!user) {
    return { safe: false, reason: "NO_USER" };
  }

  if (flags.isBanned) {
    return { safe: false, reason: "BANNED" };
  }

  return { safe: true };
}
