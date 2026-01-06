import { BrainContext } from "../types";
import { readMemory } from "../memory/localMemory";

export function decideReflection(context: BrainContext) {
  const content = readMemory().trim();

  if (!content) {
    return {
      ok: false,
      code: "REFLECT.EMPTY",
    };
  }

  // Very light, non-authoritative reflection
  const lines = content.split("\n").filter(Boolean);
  const lastLine = lines[lines.length - 1] ?? "";

  return {
    ok: true,
    code: "REFLECT.PRESENT",
    meta: {
      text: `I notice you wrote: "${lastLine}".`,
    },
  };
}
