import type { ArcDefinition } from "../../../types";
import { lesson_4_1 } from "./lessons/lesson-4-1";
import { lesson_4_2 } from "./lessons/lesson-4-2";
import { lesson_4_3 } from "./lessons/lesson-4-3";

export const arc4: ArcDefinition = {
  id: "self-repair-arc-4",
  label: "4",
  title: "Meaning & GAIA",
  description: "Use GAIA as a supportive map and connect your study paths to realistic future scenarios.",
  lessons: [lesson_4_1, lesson_4_2, lesson_4_3],
};
