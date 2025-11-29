import type { ArcDefinition } from "../../../types";
import { lesson_2_1 } from "./lessons/lesson-2-1";
import { lesson_2_2 } from "./lessons/lesson-2-2";
import { lesson_2_3 } from "./lessons/lesson-2-3";
import { lesson_2_4 } from "./lessons/lesson-2-4";

export const arc2: ArcDefinition = {
  id: "self-repair-arc-2",
  label: "2",
  title: "The Inner Voice",
  description: "Notice the inner attacker, separate it from facts, and practice more honest counter-voices.",
  lessons: [lesson_2_1, lesson_2_2, lesson_2_3, lesson_2_4],
};
