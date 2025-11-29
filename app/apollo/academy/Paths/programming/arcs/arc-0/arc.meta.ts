import type { ArcDefinition } from "../../../types";
import { lesson_0_1 } from "./lessons/lesson-0-1";
import { lesson_0_2 } from "./lessons/lesson-0-2";
import { lesson_0_3 } from "./lessons/lesson-0-3";
import { lesson_0_4 } from "./lessons/lesson-0-4";
import { lesson_0_5 } from "./lessons/lesson-0-5";
import { lesson_0_6 } from "./lessons/lesson-0-6";
import { lesson_0_7 } from "./lessons/lesson-0-7";
import { lesson_0_8 } from "./lessons/lesson-0-8";
import { lesson_0_9 } from "./lessons/lesson-0-9";

export const arc0: ArcDefinition = {
  id: "programming-arc-0",
  label: "0",
  title: "Environment & Comfort with Your Machine",
  description: "Get comfortable with files, folders, VS Code, the terminal, Git, and how the web works before you touch real projects.",
  lessons: [lesson_0_1, lesson_0_2, lesson_0_3, lesson_0_4, lesson_0_5, lesson_0_6, lesson_0_7, lesson_0_8, lesson_0_9],
};
