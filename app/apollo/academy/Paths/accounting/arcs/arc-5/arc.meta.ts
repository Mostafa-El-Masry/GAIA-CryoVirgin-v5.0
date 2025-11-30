import type { ArcDefinition, LessonDefinition } from "../../../types";

const lessons: LessonDefinition[] = [
  { id: "acc-5-1", code: "5.1", title: "Mapping Your Current Pain Points", status: "active" },
  { id: "acc-5-2", code: "5.2", title: "Defining Ideal Workflows", status: "active" },
  { id: "acc-5-3", code: "5.3", title: "Designing GAIA Helpers and Checks", status: "active" },
  { id: "acc-5-4", code: "5.4", title: "Turning Pain Points into Features and Rules", status: "active" },
];

export const arc5: ArcDefinition = {
  id: "accounting-arc-5",
  label: "5",
  title: "GAIA Accounting Center Preparation",
  description: "Capture pain points and sketch helpers so future GAIA modules solve real problems at work.",
  lessons,
};
