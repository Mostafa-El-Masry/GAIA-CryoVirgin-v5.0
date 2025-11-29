import type { ArcDefinition } from "../../../types";
import { lesson_5_1 } from "./lessons/lesson-5-1";
import { lesson_5_2 } from "./lessons/lesson-5-2";
import { lesson_5_3 } from "./lessons/lesson-5-3";

export const arc5: ArcDefinition = {
  id: "self-repair-arc-5",
  label: "5",
  title: "Relapse & Maintenance Plan",
  description: "Design what you will do on bad days: early warning signs, emergency lists, and realistic adjustments.",
  lessons: [lesson_5_1, lesson_5_2, lesson_5_3],
};
