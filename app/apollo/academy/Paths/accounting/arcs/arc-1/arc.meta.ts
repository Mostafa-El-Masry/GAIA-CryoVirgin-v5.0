import type { ArcDefinition } from "../../../types";
import { lesson_1_1 } from "./lessons/lesson-1-1";
import { lesson_1_2 } from "./lessons/lesson-1-2";
import { lesson_1_3 } from "./lessons/lesson-1-3";
import { lesson_1_4 } from "./lessons/lesson-1-4";
import { lesson_1_5 } from "./lessons/lesson-1-5";

export const arc1: ArcDefinition = {
  id: "accounting-arc-1",
  label: "1",
  title: "Foundations & Reset",
  description: "Rebuild your base in double-entry, core concepts, and everyday language grounded in your current job.",
  lessons: [lesson_1_1, lesson_1_2, lesson_1_3, lesson_1_4, lesson_1_5],
};
