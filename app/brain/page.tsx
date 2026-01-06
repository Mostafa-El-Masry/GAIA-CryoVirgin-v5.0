import { decidePassiveConsent } from "../../gaia-brain/decisions/consentPassive";
import { buildContext } from "../../gaia-brain/context/buildContext";

export type BrainDecisionType =
  | "progression"
  | "ritual"
  | "safety"
  | "greet"
  | "dictate"
  | "observe"
  | "remember"
  | "reflect"
  | "reportHealth"
  | "reportHealthTrend"
  | "consentPassive";

export function gaiaBrain(type: BrainDecisionType, rawContext: any) {
  const context = buildContext(rawContext);

  switch (type) {
    case "consentPassive":
      return decidePassiveConsent(context);

    // others unchanged
  }
}

export default function Page() {
  return null;
}
