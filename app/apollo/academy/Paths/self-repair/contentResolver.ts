import type { LessonContentData } from "../lesson/lessonContent";

type SelfRepairContent = {
  title: string;
  intro: string;
  paragraphs: string[];
  prompts?: string[];
  minutes: number;
  isMBT?: boolean;
};

const COURSE_1_CONTENT: Record<string, SelfRepairContent> = {
  "1.1": {
    title: "Mapping Your Current Rhythm (Sleep, Food, Energy)",
    intro:
      "Today you are not fixing anything. You are just putting the current pattern on the table so it stops hiding in the dark.",
    paragraphs: [
      "Take one day — either today or yesterday — and write it as a timeline. When did you wake up, nap, eat, scroll, play, watch, and sleep? No judgment. Just facts.",
      "Notice which moments feel heavy or blurry. These are usually the places where you go on autopilot: late-night scrolling, skipping meals, or gaming to avoid thinking.",
      "The goal of this lesson is simply to see the rhythm as it is. You cannot repair what you are still pretending not to see.",
    ],
    prompts: [
      "If I describe yesterday as a movie, what are the key scenes from waking up to sleep?",
      "Where do I usually feel the first big drop in energy?",
      "What is one small moment in the day that actually felt a bit good or peaceful?",
    ],
    minutes: 30,
  },
  "1.2": {
    title: "Designing One Small Daily Anchor",
    intro:
      "A daily anchor is a tiny action that tells your brain: 'We are still on my side.' It must be so small that you can do it even on a bad day.",
    paragraphs: [
      "Think of something that takes 2–5 minutes and is realistic even when you are tired: drinking a glass of water slowly, washing your face with care, writing one honest sentence in a notebook.",
      "This is not a full routine. It is one anchor. Later we can add more, but right now you are proving that you can keep one promise to yourself.",
      "Choose a time window for this anchor (for example: sometime between waking up and leaving the house), not a strict minute on the clock.",
    ],
    prompts: [
      "What is one 2–5 minute action that feels kind but not dramatic?",
      "Where in my current day can this anchor live so it doesn't fight with everything else?",
      "What usually stops me from keeping small promises to myself?",
    ],
    minutes: 25,
  },
  "1.3": {
    title: "Gentle Movement: Walks, Stretching, and Realistic Goals",
    intro:
      "Self-repair movement is not about punishing yourself at the gym. It is about reminding your body that it is allowed to move and feel alive.",
    paragraphs: [
      "Pick the easiest possible form of movement you can sustain this week: a short walk near your home, stretching on the floor, or a 5-minute routine.",
      "Your first goal is ridiculous on purpose: something like '2 minutes of stretching after I brush my teeth' or 'walk to the corner and back'.",
      "If you already exercise sometimes, make this lesson about making the foundation more gentle and more consistent, not heavier.",
    ],
    prompts: [
      "What type of movement feels least scary or embarrassing to me right now?",
      "What is a tiny movement goal that I could repeat 3–5 times this week without burning out?",
      "How does my body feel right after even 2–3 minutes of movement, compared to before?",
    ],
    minutes: 25,
  },
  "1.4": {
    title: "Bad Days Protocol: Minimum Baseline to Not Collapse",
    intro:
      "Bad days will come. The goal is not to avoid them, but to reduce the damage they do to you and to your future.",
    paragraphs: [
      "Define a 'minimum baseline' for bad days: the absolute smallest version of self-care you will still try to do when everything feels heavy.",
      "This can be things like: one proper meal, one glass of water, a quick shower, answering one important message, and going to bed before a certain time.",
      "Write your bad day protocol somewhere visible so that when the next crash comes, you don't have to think — you just follow the script.",
    ],
    prompts: [
      "What does a bad day usually look like for me right now?",
      "If I could only keep 3 actions alive on a bad day, what would they be?",
      "Who (or what) could help remind me of my bad day protocol when I start to slip?",
    ],
    minutes: 30,
  },
};

// Placeholder for Course 2-5
const COURSE_2_5_CONTENT: Record<string, SelfRepairContent> = {};

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

  let content: SelfRepairContent | undefined;

  if (courseNum === "1") {
    content = COURSE_1_CONTENT[lessonCode];
  } else if (["2", "3", "4", "5"].includes(courseNum)) {
    content = COURSE_2_5_CONTENT[lessonCode];
  }

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

  return {
    study: {
      title: content.title,
      paragraphs: [content.intro, ...content.paragraphs],
    },
  };
}
