import type { ArcDefinition } from "../../types";
import { lesson_1_1 } from "./lessons/lesson-1-1";
import { lesson_1_2 } from "./lessons/lesson-1-2";

export const arc1: ArcDefinition = {
  id: "self-repair-arc-1",
  label: "1",
  title: "Stabilizing the Basics",
  description:
    "Map your current rhythm and prepare one safe, simple repair point.",
  lessons: [lesson_1_1, lesson_1_2],
};
