import type { ArcDefinition } from "../../types";
import { lesson_1_1 } from "./lessons/lesson-1-1";
import { lesson_1_2 } from "./lessons/lesson-1-2";

export const arc1: ArcDefinition = {
  id: "programming-arc-1",
  label: "1",
  title: "Foundations",
  description: "Get your basic tools, mental models, and workflow in place.",
  lessons: [lesson_1_1, lesson_1_2],
};
