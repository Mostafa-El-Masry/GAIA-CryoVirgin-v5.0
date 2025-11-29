import type { LessonContentData } from "../lesson/lessonContent";
import {
  getFoundationsStudy,
  getFoundationsQuiz,
} from "../../programming/sections/foundations";
import { getHtmlStudy, getHtmlQuiz } from "../../programming/sections/html";
import { getCssStudy, getCssQuiz } from "../../programming/sections/css";
import { getJsStudy, getJsQuiz } from "../../programming/sections/javascript";
import {
  getReactNextStudy,
  getReactNextQuiz,
} from "../../programming/sections/reactNext";
import {
  getSupabaseStudy,
  getSupabaseQuiz,
} from "../../programming/sections/supabase";
import {
  getCapstoneStudy,
  getCapstoneQuiz,
} from "../../programming/sections/capstone";

export function resolveProgrammingContent(lessonId: string): LessonContentData {
  // lessonId format: "prog-0-1", "prog-1-1", etc.
  // Extract course code: "prog-1-2" -> "1.2"
  const match = lessonId.match(/prog-(\d+)-(\d+)/);
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

  // Try all resolvers to find the lesson content
  const resolvers = [
    getFoundationsStudy,
    getHtmlStudy,
    getCssStudy,
    getJsStudy,
    getReactNextStudy,
    getSupabaseStudy,
    getCapstoneStudy,
  ];

  for (const resolver of resolvers) {
    const study = resolver(lessonCode);
    if (study) {
      return {
        study,
        quiz: null, // Quiz support can be added later
      };
    }
  }

  // Fallback for unmapped lessons
  return {
    study: {
      title: "Lesson coming soon",
      paragraphs: [
        "This programming lesson is planned in your GAIA roadmap but has not been written yet.",
        "You can use this space to add your own notes and code experiments until the lesson content arrives.",
      ],
    },
  };
}
