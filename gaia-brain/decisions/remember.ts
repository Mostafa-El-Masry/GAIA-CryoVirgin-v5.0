import { BrainContext } from "../types";

export function decideRemember(context: BrainContext & { content: string }) {
  return {
    ok: true,
    code: "MEMORY.REMEMBERED",
    meta: {
      length: context.content.length,
      timestamp: Date.now(),
    },
  };
}
