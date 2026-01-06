import { buildContext } from "./context/buildContext";
import { decideReflection } from "./decisions/reflect";

export type BrainDecisionType =
  | "progression"
  | "ritual"
  | "safety"
  | "greet"
  | "dictate"
  | "observe"
  | "remember"
  | "reflect";

export function gaiaBrain(type: BrainDecisionType, rawContext: any) {
  const context = buildContext(rawContext);

  switch (type) {
    case "reflect":
      return decideReflection(context);

    // other cases unchanged
  }
}
