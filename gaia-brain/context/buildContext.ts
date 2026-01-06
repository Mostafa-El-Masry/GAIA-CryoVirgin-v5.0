// /gaia-brain/context/buildContext.ts

import { BrainContext } from "../types";

export function buildContext(raw: any): BrainContext {
  return {
    user: raw?.user ?? null,
    timeline: raw?.timeline ?? { phase: 0 },
    health: raw?.health ?? {},
    wealth: raw?.wealth ?? {},
    flags: raw?.flags ?? {},
    now: new Date(),
  };
}
