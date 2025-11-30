import type { LessonContentData } from "../../../../lesson/lessonContent";

export const selfLesson11: LessonContentData = {
  study: {
    title: "Mapping Your Current Rhythm (Sleep, Food, Energy)",
    paragraphs: [
      "Today you are not fixing anything. You are just putting the current pattern on the table so it stops hiding in the dark.",
      "Take one day — either today or yesterday — and write it as a timeline. When did you wake up, nap, eat, scroll, play, watch, and sleep? No judgment. Just facts.",
      "Notice which moments feel heavy or blurry. These are usually the places where you go on autopilot: late-night scrolling, skipping meals, or gaming to avoid thinking.",
      "The goal of this lesson is simply to see the rhythm as it is. You cannot repair what you are still pretending not to see.",
    ],
  },
  quiz: {
    id: "self-1.1-quiz",
    title: "Seeing your real daily rhythm",
    questions: [
      {
        id: "q1",
        prompt: "What is the main goal of this lesson?",
        options: [
          { id: "q1-a", label: "Fix every bad habit immediately" },
          { id: "q1-b", label: "Document your day honestly without judgment" },
          { id: "q1-c", label: "Design a 2-hour morning routine" },
          { id: "q1-d", label: "Track calories for the week" },
        ],
        correctOptionId: "q1-b",
        explanation:
          "The focus is to put the current pattern on the table without trying to fix it yet.",
      },
      {
        id: "q2",
        prompt: "Which kind of moments should you pay extra attention to?",
        options: [
          { id: "q2-a", label: "Moments that feel heavy or blurry" },
          { id: "q2-b", label: "Only the happy moments" },
          { id: "q2-c", label: "Moments when you feel bored" },
          { id: "q2-d", label: "Times you are at work" },
        ],
        correctOptionId: "q2-a",
        explanation:
          "Heavy or blurry moments usually show where you go on autopilot or lose energy.",
      },
      {
        id: "q3",
        prompt: "What should your timeline include?",
        options: [
          { id: "q3-a", label: "Wake, sleep, meals, scrolling, playing, watching, resting" },
          { id: "q3-b", label: "Only meals" },
          { id: "q3-c", label: "Only exercise and work" },
          { id: "q3-d", label: "Just achievements" },
        ],
        correctOptionId: "q3-a",
        explanation:
          "Capture the whole day: wake, sleep, meals, scrolling, playing, watching, and rest.",
      },
    ],
  },
};
