import fs from "fs";
import path from "path";

export interface Context {
  constraints: string[];
  freezeActive: boolean;
}

export function buildContext(): Context {
  const freezePath = path.resolve("core/cognitive-freeze.json");

  let freezeActive = false;

  if (fs.existsSync(freezePath)) {
    const freeze = JSON.parse(fs.readFileSync(freezePath, "utf-8"));
    freezeActive = freeze.status === "active";
  }

  return {
    constraints: ["no_learning", "no_autonomy", "deterministic_only"],
    freezeActive,
  };
}
