import type { ArcDefinition } from "../../../types";
import { lesson_2_1 } from "./lessons/lesson-2-1";
import { lesson_2_2 } from "./lessons/lesson-2-2";
import { lesson_2_3 } from "./lessons/lesson-2-3";
import { lesson_2_4 } from "./lessons/lesson-2-4";
import { lesson_2_5 } from "./lessons/lesson-2-5";

export const arc2: ArcDefinition = {
  id: "accounting-arc-2",
  label: "2",
  title: "Financial Statements with Confidence",
  description: "Refresh the balance sheet, income statement, and cash flow, and connect each line to real activity.",
  lessons: [lesson_2_1, lesson_2_2, lesson_2_3, lesson_2_4, lesson_2_5],
};
