// /gaia-brain/decisions/greet.ts
import { BrainContext } from "../types"
import { SYSTEM_NAME } from "../system"

export function decideGreeting(context: BrainContext) {
  const userName =
    context?.user?.name ||
    context?.user?.displayName ||
    context?.user?.email ||
    "Star"

  return {
    ok: true,
    code: "GREET.HELLO",
    meta: {
      text: `Hi, I'm ${userName}. This is ${SYSTEM_NAME}.`
    }
  }
}
