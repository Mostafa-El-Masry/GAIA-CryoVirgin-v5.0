import type { ArcDefinition } from "../../../types";
import { lesson_1_1 } from "./lessons/lesson-1-1";
import { lesson_1_2 } from "./lessons/lesson-1-2";
import { lesson_1_3 } from "./lessons/lesson-1-3";

export const arc1: ArcDefinition = {
  id: "programming-arc-1",
  label: "1",
  title: "Programming Mindset & Study System",
  description: "Learn how to study without burning out and set up a realistic rhythm for GAIA.",
  lessons: [lesson_1_1, lesson_1_2, lesson_1_3],
};
