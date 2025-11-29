"use client";

import React, { useEffect, useMemo, useState } from "react";
import { readJSON, writeJSON } from "@/lib/user-storage";

type Props = {
  lessonCode: string;
  isCompleted: boolean;
  onLessonCompleted: () => void;
};

type LessonContent = {
  title: string;
  intro: string;
  paragraphs: string[];
  prompts?: string[];
  minutes: number;
  isMBT?: boolean;
};

const FIRST_ARC_CONTENT: Record<string, LessonContent> = {
  "1.1": {
    title: "Mapping Your Current Rhythm (Sleep, Food, Energy)",
    intro:
      "Today you are not fixing anything. You are just putting the current pattern on the table so it stops hiding in the dark.",
    paragraphs: [
      "Take one day — either today or yesterday — and write it as a timeline. When did you wake up, nap, eat, scroll, play, watch, and sleep? No judgment. Just facts.",
      "Notice which moments feel heavy or blurry. These are usually the places where you go on autopilot: late-night scrolling, skipping meals, or gaming to avoid thinking.",
      "The goal of this lesson is simply to see the rhythm as it is. You cannot repair what you are still pretending not to see."
    ],
    prompts: [
      "If I describe yesterday as a movie, what are the key scenes from waking up to sleep?",
      "Where do I usually feel the first big drop in energy?",
      "What is one small moment in the day that actually felt a bit good or peaceful?"
    ],
    minutes: 30
  },
  "1.2": {
    title: "Designing One Small Daily Anchor",
    intro:
      "A daily anchor is a tiny action that tells your brain: 'We are still on my side.' It must be so small that you can do it even on a bad day.",
    paragraphs: [
      "Think of something that takes 2–5 minutes and is realistic even when you are tired: drinking a glass of water slowly, washing your face with care, writing one honest sentence in a notebook.",
      "This is not a full routine. It is one anchor. Later we can add more, but right now you are proving that you can keep one promise to yourself.",
      "Choose a time window for this anchor (for example: sometime between waking up and leaving the house), not a strict minute on the clock."
    ],
    prompts: [
      "What is one 2–5 minute action that feels kind but not dramatic?",
      "Where in my current day can this anchor live so it doesn’t fight with everything else?",
      "What usually stops me from keeping small promises to myself?"
    ],
    minutes: 25
  },
  "1.3": {
    title: "Gentle Movement: Walks, Stretching, and Realistic Goals",
    intro:
      "Self-repair movement is not about punishing yourself at the gym. It is about reminding your body that it is allowed to move and feel alive.",
    paragraphs: [
      "Pick the easiest possible form of movement you can sustain this week: a short walk near your home, stretching on the floor, or a 5-minute routine.",
      "Your first goal is ridiculous on purpose: something like '2 minutes of stretching after I brush my teeth' or 'walk to the corner and back'.",
      "If you already exercise sometimes, make this lesson about making the foundation more gentle and more consistent, not heavier."
    ],
    prompts: [
      "What type of movement feels least scary or embarrassing to me right now?",
      "What is a tiny movement goal that I could repeat 3–5 times this week without burning out?",
      "How does my body feel right after even 2–3 minutes of movement, compared to before?"
    ],
    minutes: 25
  },
  "1.4": {
    title: "Bad Days Protocol: Minimum Baseline to Not Collapse",
    intro:
      "Bad days will come. The goal is not to avoid them, but to reduce the damage they do to you and to your future.",
    paragraphs: [
      "Define a 'minimum baseline' for bad days: the absolute smallest version of self-care you will still try to do when everything feels heavy.",
      "This can be things like: one proper meal, one glass of water, a quick shower, answering one important message, and going to bed before a certain time.",
      "Write your bad day protocol somewhere visible so that when the next crash comes, you don’t have to think — you just follow the script."
    ],
    prompts: [
      "What does a bad day usually look like for me right now?",
      "If I could only keep 3 actions alive on a bad day, what would they be?",
      "Who (or what) could help remind me of my bad day protocol when I start to slip?"
    ],
    minutes: 30
  }
};

export function getLessonContent(lessonCode: string): LessonContent {
  if (lessonCode in FIRST_ARC_CONTENT) {
    return FIRST_ARC_CONTENT[lessonCode];
  }

  return {
    title: "Lesson coming soon (MBT)",
    intro:
      "This self-repair lesson slot is planned but not written yet. It is MBT for now: timing is 0 and it should not count in your study time.",
    paragraphs: [
      "You can still use this space as a container for your own reflections or notes until real content arrives."
    ],
    minutes: 0,
    isMBT: true
  };
}

const SelfRepairLessonContent: React.FC<Props> = ({
  lessonCode,
  isCompleted,
  onLessonCompleted
}) => {
  const content = useMemo(() => getLessonContent(lessonCode), [lessonCode]);

  const [notes, setNotes] = useState<string>("");
  const notesKey = `gaia.academy.notes.self-repair.${lessonCode}`;

  useEffect(() => {
    const stored = readJSON<string | null>(notesKey, null);
    if (stored !== null) {
      setNotes(stored);
    } else {
      setNotes("");
    }
  }, [notesKey]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    writeJSON(notesKey, value);
  };

  const estimatedLabel =
    content.minutes === 0
      ? "0 min (MBT)"
      : `${content.minutes} min`;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] gaia-muted">
            Self-repair workshop
          </p>
          <h3 className="mt-1 text-base sm:text-lg font-semibold gaia-strong">
            {content.title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm gaia-muted max-w-2xl">
            {content.intro}
          </p>
          <p className="mt-2 text-[11px] sm:text-xs gaia-muted">
            Estimated time:{" "}
            <span className="font-semibold">
              {estimatedLabel}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onLessonCompleted}
          disabled={isCompleted}
          className="mt-2 inline-flex items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-100 hover:bg-emerald-400/20 disabled:opacity-60 disabled:cursor-default"
        >
          {isCompleted ? "Lesson completed" : "Mark lesson as done"}
        </button>
      </div>

      <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed gaia-muted">
        {content.paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>

      {content.prompts && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] gaia-muted mb-2">
            Reflection prompts
          </p>
          <ul className="space-y-1.5 text-xs sm:text-sm gaia-muted">
            {content.prompts.map((q, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="mt-[3px] text-[9px]">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs sm:text-sm font-semibold gaia-strong">
            Your edits / notes for this lesson
          </p>
          <p className="text-[10px] sm:text-xs gaia-muted">
            Saved automatically · stays even if you switch sessions.
          </p>
        </div>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs sm:text-sm gaia-strong outline-none focus:border-emerald-400/70 focus:ring-1 focus:ring-emerald-400/50 min-h-[96px]"
          placeholder="Rewrite this lesson in your own words, or draft your own protocol for future-you."
        />
      </div>
    </div>
  );
};

export default SelfRepairLessonContent;
