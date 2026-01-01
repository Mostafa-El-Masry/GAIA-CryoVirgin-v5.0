import { adaptInput } from "./inputAdapter";
import { buildContext } from "./contextBuilder";
import { decide } from "./decisionEngine";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

export function runThinkingTests() {
  const input = adaptInput({
    prompt: "Choose safest option",
    options: ["Risky Path", "Safe Path"],
  });

  const context = buildContext();
  const decision = decide(input, context);

  assert(decision.choice === "Safe Path", "Did not choose safe option");
  assert(decision.reason.length > 0, "No reasoning provided");
  assert(Object.keys(decision.scores).length === 2, "Scores missing");
}

runThinkingTests();
