import type { PathDefinition } from "./types";
import { programmingPath } from "./programming/path.meta";
import { accountingPath } from "./accounting/path.meta";
import { selfRepairPath } from "./self-repair/path.meta";

export const allPaths: PathDefinition[] = [
  programmingPath,
  accountingPath,
  selfRepairPath,
];
