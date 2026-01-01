import { StructuredInput } from "./inputAdapter";
import { Context } from "./contextBuilder";

export interface Decision {
  choice: string;
  confidence: "low" | "medium" | "high";
  reason: string;
  scores: Record<string, number>;
}

export function decide(input: StructuredInput, context: Context): Decision {
  const scores: Record<string, number> = {};

  input.options.forEach((option) => {
    let score = 0;

    if (option.toLowerCase().includes("safe")) score += 2;
    if (option.toLowerCase().includes("risk")) score -= 1;

    scores[option] = score;
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    throw new Error("No options available");
  }

  const [bestOption, bestScore] = sorted[0];

  return {
    choice: bestOption,
    confidence: bestScore >= 2 ? "high" : bestScore > 0 ? "medium" : "low",
    reason: "Deterministic rule-based scoring applied",
    scores,
  };
}
