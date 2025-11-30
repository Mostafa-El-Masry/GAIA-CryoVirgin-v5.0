import type { ArcDefinition, LessonDefinition } from "../../../types";

const lessons: LessonDefinition[] = [
  { id: "self-1-1", code: "1.1", title: "Mapping Your Current Rhythm (Sleep, Food, Energy)", status: "active" },
  { id: "self-1-2", code: "1.2", title: "Designing One Small Daily Anchor", status: "active" },
  { id: "self-1-3", code: "1.3", title: "Gentle Movement: Walks, Stretching, and Realistic Goals", status: "active" },
  { id: "self-1-4", code: "1.4", title: "Bad Days Protocol: Minimum Baseline to Not Collapse", status: "active" },
];

export const arc1: ArcDefinition = {
  id: "self-repair-arc-1",
  label: "1",
  title: "Stabilizing the Basics",
  description: "Sleep, food, gentle movement, and one small anchor so your baseline feels safer.",
  lessons,
};
