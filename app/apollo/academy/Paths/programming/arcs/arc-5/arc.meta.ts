import type { ArcDefinition } from "../../../types";
import { lesson_5_1 } from "./lessons/lesson-5-1";
import { lesson_5_2 } from "./lessons/lesson-5-2";
import { lesson_5_3 } from "./lessons/lesson-5-3";
import { lesson_5_4 } from "./lessons/lesson-5-4";
import { lesson_5_5 } from "./lessons/lesson-5-5";

export const arc5: ArcDefinition = {
  id: "programming-arc-5",
  label: "5",
  title: "React & Next.js",
  description: "Move from static pages to components and routes, and connect them to GAIA-style layouts.",
  lessons: [lesson_5_1, lesson_5_2, lesson_5_3, lesson_5_4, lesson_5_5],
};
