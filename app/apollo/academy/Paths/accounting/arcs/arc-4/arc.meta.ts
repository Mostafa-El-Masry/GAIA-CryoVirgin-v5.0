import type { ArcDefinition } from "../../../types";
import { lesson_4_1 } from "./lessons/lesson-4-1";
import { lesson_4_2 } from "./lessons/lesson-4-2";
import { lesson_4_3 } from "./lessons/lesson-4-3";
import { lesson_4_4 } from "./lessons/lesson-4-4";
import { lesson_4_5 } from "./lessons/lesson-4-5";
import { lesson_4_6 } from "./lessons/lesson-4-6";

export const arc4: ArcDefinition = {
  id: "accounting-arc-4",
  label: "4",
  title: "Analysis, Closing & Explaining Numbers",
  description: "Do basic variance analysis, handle closing steps, and explain numbers simply to non-accountants.",
  lessons: [lesson_4_1, lesson_4_2, lesson_4_3, lesson_4_4, lesson_4_5, lesson_4_6],
};
