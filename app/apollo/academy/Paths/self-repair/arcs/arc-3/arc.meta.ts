import type { ArcDefinition } from "../../../types";
import { lesson_3_1 } from "./lessons/lesson-3-1";
import { lesson_3_2 } from "./lessons/lesson-3-2";
import { lesson_3_3 } from "./lessons/lesson-3-3";
import { lesson_3_4 } from "./lessons/lesson-3-4";

export const arc3: ArcDefinition = {
  id: "self-repair-arc-3",
  label: "3",
  title: "People & Boundaries",
  description: "Map draining vs supportive relationships and practice tiny boundaries to protect energy.",
  lessons: [lesson_3_1, lesson_3_2, lesson_3_3, lesson_3_4],
};
