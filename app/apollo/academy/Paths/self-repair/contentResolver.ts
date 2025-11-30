import type { LessonContentData } from "../lesson/lessonContent";
import { selfLesson11 } from "./arcs/arc-1/lessons/lesson-1-1";
import { selfLesson12 } from "./arcs/arc-1/lessons/lesson-1-2";
import { selfLesson13 } from "./arcs/arc-1/lessons/lesson-1-3";
import { selfLesson14 } from "./arcs/arc-1/lessons/lesson-1-4";

const LESSON_MAP: Record<string, LessonContentData> = {
  "1.1": selfLesson11,
  "1.2": selfLesson12,
  "1.3": selfLesson13,
  "1.4": selfLesson14,
};

export function resolveSelfRepairContent(lessonId: string): LessonContentData {
  // Extract course code from lessonId: "self-1-1" -> "1.1"
  const match = lessonId.match(/self-(\d+)-(\d+)/);
  if (!match) {
    return {
      study: {
        title: "Unknown lesson",
        paragraphs: ["This lesson ID does not match the expected format."],
      },
    };
  }

  const courseNum = match[1];
  const lessonNum = match[2];
  const lessonCode = `${courseNum}.${lessonNum}`;

  const content = LESSON_MAP[lessonCode];

  if (!content) {
    return {
      study: {
        title: "Lesson coming soon (MBT)",
        paragraphs: [
          "This self-repair lesson is planned but not written yet. It is MBT for now.",
          "You can use this space to add your own notes and reflections until the lesson content arrives.",
        ],
      },
    };
  }

  return content;
}
