import { adaptInput } from "./inputAdapter";
import { buildContext } from "./contextBuilder";
import { decide } from "./decisionEngine";
import { recordTrace } from "./traceRecorder";

const rawInput = {
  prompt: "Choose a path",
  options: ["Path A", "Path B"],
};

const structured = adaptInput(rawInput);
const context = buildContext();
const decision = decide(structured, context);
const trace = recordTrace(decision);

console.log("Decision:", decision);
console.log("Trace:", trace);
