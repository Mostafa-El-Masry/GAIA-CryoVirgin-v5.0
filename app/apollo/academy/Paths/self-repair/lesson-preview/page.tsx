"use client";

import { LessonLayout } from "../../components/LessonLayout";
import type { LessonNavItem } from "../../components/LessonSidebar";

const lessons: LessonNavItem[] = [
  { id: "self-1-1", code: "1.1", title: "Stabilizing the Basics: Map Your Real Day" },
  { id: "self-1-2", code: "1.2", title: "Designing One Small Daily Anchor" },
  { id: "self-1-3", code: "1.3", title: "Gentle Movement: Walks, Stretching, and Realistic Goals" },
  { id: "self-1-4", code: "1.4", title: "Bad Days Protocol: Minimum Baseline to Not Collapse" },
];

export default function SelfRepairLessonPreviewPage() {
  return (
    <LessonLayout
      pathTitle="Self-Repair · Arc 1"
      courseTitle="Stabilizing the Basics"
      lessonTitle="Stabilizing the Basics: Map Your Real Day"
      durationLabel="Approx. 45 minutes"
      lessons={lessons}
      activeLessonId="self-1-1"
    />
  );
}
