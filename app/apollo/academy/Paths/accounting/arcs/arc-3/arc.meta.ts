import type { ArcDefinition } from "../../../types";
import { lesson_3_1 } from "./lessons/lesson-3-1";
import { lesson_3_2 } from "./lessons/lesson-3-2";
import { lesson_3_3 } from "./lessons/lesson-3-3";
import { lesson_3_4 } from "./lessons/lesson-3-4";
import { lesson_3_5 } from "./lessons/lesson-3-5";
import { lesson_3_6 } from "./lessons/lesson-3-6";

export const arc3: ArcDefinition = {
  id: "accounting-arc-3",
  label: "3",
  title: "Tools, Systems & Clean Data",
  description: "Tame Excel/Sheets and your accounting software with checklists, templates, and routines.",
  lessons: [lesson_3_1, lesson_3_2, lesson_3_3, lesson_3_4, lesson_3_5, lesson_3_6],
};
