/**
 * Unified lesson content resolver for all tracks
 * Maps lesson IDs to their content (study, quiz, practice, etc.)
 */

export type StudyDescription = {
  title: string;
  paragraphs: string[];
  videoUrl?: string;
};

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
};

export type QuizConfig = {
  id: string;
  title: string;
  questions: QuizQuestion[];
};

export type PracticePrompt = {
  title: string;
  description: string;
  instructions: string[];
};

export type LessonContentData = {
  study: StudyDescription;
  quiz?: QuizConfig | null;
  practice?: PracticePrompt | null;
};

// Import resolvers from track-specific files
import { resolveProgrammingContent } from "../programming/contentResolver";
import { resolveAccountingContent } from "../accounting/contentResolver";
import { resolveSelfRepairContent } from "../self-repair/contentResolver";

export function getLessonContent(
  lessonId: string,
  trackId: string
): LessonContentData {
  // lessonId format: "prog-1-1", "acc-1-1", "self-1-1"

  if (trackId === "programming" || lessonId.startsWith("prog-")) {
    return resolveProgrammingContent(lessonId);
  }

  if (trackId === "accounting" || lessonId.startsWith("acc-")) {
    return resolveAccountingContent(lessonId);
  }

  if (trackId === "self-repair" || lessonId.startsWith("self-")) {
    return resolveSelfRepairContent(lessonId);
  }

  // Fallback for unknown lesson
  return {
    study: {
      title: "Lesson coming soon",
      paragraphs: [
        "This lesson is planned in your GAIA roadmap but has not been written yet.",
        "You can use this space to add your own notes in the meantime.",
      ],
    },
  };
}
