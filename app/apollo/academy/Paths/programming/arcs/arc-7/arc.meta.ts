import type { ArcDefinition } from "../../../types";
import { lesson_7_1 } from "./lessons/lesson-7-1";
import { lesson_7_2 } from "./lessons/lesson-7-2";
import { lesson_7_3 } from "./lessons/lesson-7-3";
import { lesson_7_4 } from "./lessons/lesson-7-4";

export const arc7: ArcDefinition = {
  id: "programming-arc-7",
  label: "7",
  title: "Capstone & Integration",
  description: "Pull everything together into a small end-to-end project connected to your GAIA roadmap.",
  lessons: [lesson_7_1, lesson_7_2, lesson_7_3, lesson_7_4],
};
