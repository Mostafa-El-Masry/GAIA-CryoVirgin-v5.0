import { BrainContext } from "../types"

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function decidePassiveConsent(context: BrainContext) {
  const phrases = [
    `If you ever want my interpretation, you can ask.`,
    `I can offer interpretations if you choose to invite them.`,
    `I’m able to interpret patterns, but I won’t unless you want me to.`,
    `If you’d like me to go beyond reporting, let me know.`,
    `I can help interpret what I see — only if you ask.`,
  ]

  return {
    ok: true,
    code: "CONSENT.PASSIVE",
    meta: {
      text: pick(phrases),
    },
  }
}
