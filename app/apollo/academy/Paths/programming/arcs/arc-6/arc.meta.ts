import type { ArcDefinition } from "../../../types";
import { lesson_6_1 } from "./lessons/lesson-6-1";
import { lesson_6_2 } from "./lessons/lesson-6-2";
import { lesson_6_3 } from "./lessons/lesson-6-3";
import { lesson_6_4 } from "./lessons/lesson-6-4";

export const arc6: ArcDefinition = {
  id: "programming-arc-6",
  label: "6",
  title: "Supabase & Data",
  description: "Connect your apps to a real database, save data, and fetch it back safely for GAIA Awakening.",
  lessons: [lesson_6_1, lesson_6_2, lesson_6_3, lesson_6_4],
};
