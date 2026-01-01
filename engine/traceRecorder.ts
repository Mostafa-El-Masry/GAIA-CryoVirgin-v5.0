import fs from "fs";
import path from "path";
import { Decision } from "./decisionEngine";

export interface Trace {
  timestamp: string;
  decision: Decision;
}

const TRACE_PATH = path.resolve("cognitive/decision-traces.json");

export function recordTrace(decision: Decision): Trace {
  const trace: Trace = {
    timestamp: new Date().toISOString(),
    decision,
  };

  let existing: Trace[] = [];

  if (fs.existsSync(TRACE_PATH)) {
    existing = JSON.parse(fs.readFileSync(TRACE_PATH, "utf-8"));
  }

  existing.push(trace);

  fs.writeFileSync(TRACE_PATH, JSON.stringify(existing, null, 2));

  return trace;
}
