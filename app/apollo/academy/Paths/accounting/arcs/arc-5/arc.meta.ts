import type { ArcDefinition } from "../../../types";
import { lesson_5_1 } from "./lessons/lesson-5-1";
import { lesson_5_2 } from "./lessons/lesson-5-2";
import { lesson_5_3 } from "./lessons/lesson-5-3";
import { lesson_5_4 } from "./lessons/lesson-5-4";

export const arc5: ArcDefinition = {
  id: "accounting-arc-5",
  label: "5",
  title: "GAIA Accounting Center Preparation",
  description: "Capture pain points and sketch helpers so future GAIA modules solve real problems at work.",
  lessons: [lesson_5_1, lesson_5_2, lesson_5_3, lesson_5_4],
};
