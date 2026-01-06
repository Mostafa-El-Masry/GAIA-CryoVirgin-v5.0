import { BrainContext } from "../types";

export function decideObservation(context: BrainContext) {
  return {
    ok: true,
    code: "OBSERVE.SILENT",
    meta: {
      timestamp: Date.now(),
      hasUser: Boolean(context?.user),
    },
  };
}
