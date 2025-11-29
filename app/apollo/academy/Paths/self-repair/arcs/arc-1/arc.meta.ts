import type { ArcDefinition } from "../../../types";
import { lesson_1_1 } from "./lessons/lesson-1-1";
import { lesson_1_2 } from "./lessons/lesson-1-2";
import { lesson_1_3 } from "./lessons/lesson-1-3";
import { lesson_1_4 } from "./lessons/lesson-1-4";

export const arc1: ArcDefinition = {
  id: "self-repair-arc-1",
  label: "1",
  title: "Stabilizing the Basics",
  description: "Sleep, food, gentle movement, and one small anchor so your baseline feels safer.",
  lessons: [lesson_1_1, lesson_1_2, lesson_1_3, lesson_1_4],
};
