import type { LessonContentData } from "../lesson/lessonContent";
import { accountingLesson11 } from "./arcs/arc-1/lessons/lesson-1-1";
import { accountingLesson12 } from "./arcs/arc-1/lessons/lesson-1-2";
import { accountingLesson13 } from "./arcs/arc-1/lessons/lesson-1-3";
import { accountingLesson14 } from "./arcs/arc-1/lessons/lesson-1-4";
import { accountingLesson15 } from "./arcs/arc-1/lessons/lesson-1-5";
import { accountingLesson21 } from "./arcs/arc-2/lessons/lesson-2-1";
import { accountingLesson22 } from "./arcs/arc-2/lessons/lesson-2-2";
import { accountingLesson23 } from "./arcs/arc-2/lessons/lesson-2-3";
import { accountingLesson24 } from "./arcs/arc-2/lessons/lesson-2-4";
import { accountingLesson25 } from "./arcs/arc-2/lessons/lesson-2-5";
import { accountingLesson31 } from "./arcs/arc-3/lessons/lesson-3-1";
import { accountingLesson32 } from "./arcs/arc-3/lessons/lesson-3-2";
import { accountingLesson33 } from "./arcs/arc-3/lessons/lesson-3-3";
import { accountingLesson34 } from "./arcs/arc-3/lessons/lesson-3-4";
import { accountingLesson35 } from "./arcs/arc-3/lessons/lesson-3-5";
import { accountingLesson36 } from "./arcs/arc-3/lessons/lesson-3-6";
import { accountingLesson41 } from "./arcs/arc-4/lessons/lesson-4-1";
import { accountingLesson42 } from "./arcs/arc-4/lessons/lesson-4-2";
import { accountingLesson43 } from "./arcs/arc-4/lessons/lesson-4-3";
import { accountingLesson44 } from "./arcs/arc-4/lessons/lesson-4-4";
import { accountingLesson45 } from "./arcs/arc-4/lessons/lesson-4-5";
import { accountingLesson46 } from "./arcs/arc-4/lessons/lesson-4-6";
import { accountingLesson51 } from "./arcs/arc-5/lessons/lesson-5-1";
import { accountingLesson52 } from "./arcs/arc-5/lessons/lesson-5-2";
import { accountingLesson53 } from "./arcs/arc-5/lessons/lesson-5-3";
import { accountingLesson54 } from "./arcs/arc-5/lessons/lesson-5-4";

const LESSONS: Record<string, LessonContentData> = {
  "1.1": accountingLesson11,
  "1.2": accountingLesson12,
  "1.3": accountingLesson13,
  "1.4": accountingLesson14,
  "1.5": accountingLesson15,
  "2.1": accountingLesson21,
  "2.2": accountingLesson22,
  "2.3": accountingLesson23,
  "2.4": accountingLesson24,
  "2.5": accountingLesson25,
  "3.1": accountingLesson31,
  "3.2": accountingLesson32,
  "3.3": accountingLesson33,
  "3.4": accountingLesson34,
  "3.5": accountingLesson35,
  "3.6": accountingLesson36,
  "4.1": accountingLesson41,
  "4.2": accountingLesson42,
  "4.3": accountingLesson43,
  "4.4": accountingLesson44,
  "4.5": accountingLesson45,
  "4.6": accountingLesson46,
  "5.1": accountingLesson51,
  "5.2": accountingLesson52,
  "5.3": accountingLesson53,
  "5.4": accountingLesson54,
};

export function resolveAccountingContent(lessonId: string): LessonContentData {
  const match = lessonId.match(/acc-(\d+)-(\d+)/);
  if (!match) {
    return {
      study: {
        title: "Unknown lesson",
        paragraphs: ["This lesson ID does not match the expected format."],
      },
    };
  }

  const lessonCode = `${match[1]}.${match[2]}`;
  const content = LESSONS[lessonCode];

  if (!content) {
    return {
      study: {
        title: "Lesson coming soon",
        paragraphs: [
          "This accounting lesson is planned in your GAIA roadmap but detailed content has not been written yet.",
          "You can use this space to add your own notes and examples from your work until the lesson content arrives.",
        ],
      },
    };
  }

  return content;
}
