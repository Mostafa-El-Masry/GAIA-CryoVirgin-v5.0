import type { ArcDefinition } from "../../../types";
import { lesson_3_1 } from "./lessons/lesson-3-1";
import { lesson_3_2 } from "./lessons/lesson-3-2";
import { lesson_3_3 } from "./lessons/lesson-3-3";
import { lesson_3_4 } from "./lessons/lesson-3-4";
import { lesson_3_5 } from "./lessons/lesson-3-5";
import { lesson_3_6 } from "./lessons/lesson-3-6";
import { lesson_3_7 } from "./lessons/lesson-3-7";
import { lesson_3_8 } from "./lessons/lesson-3-8";
import { lesson_3_9 } from "./lessons/lesson-3-9";
import { lesson_3_10 } from "./lessons/lesson-3-10";

export const arc3: ArcDefinition = {
  id: "programming-arc-3",
  label: "3",
  title: "CSS & Tailwind Foundations",
  description: "Understand the box model, layout, responsive design, and how Tailwind fits into your projects.",
  lessons: [lesson_3_1, lesson_3_2, lesson_3_3, lesson_3_4, lesson_3_5, lesson_3_6, lesson_3_7, lesson_3_8, lesson_3_9, lesson_3_10],
};
