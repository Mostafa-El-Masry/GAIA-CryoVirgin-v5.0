import type { ArcDefinition } from "./types";
import type { TrackId } from "../lessonsMap";
import { arcs as programmingArcs } from "./programming/arcs";
import { arcs as accountingArcs } from "./accounting/arcs";
import { arcs as selfRepairArcs } from "./self-repair/arcs";

export const arcsByTrack: Record<TrackId, ArcDefinition[]> = {
  programming: programmingArcs,
  accounting: accountingArcs,
  "self-repair": selfRepairArcs,
};
