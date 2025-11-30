import {
  StudyDescription,
  QuizConfig,
  PracticePrompt,
  PracticeCheckResult,
} from "../lessonTypes";

export function getCapstoneStudy(lessonCode: string): StudyDescription | null {
  switch (lessonCode) {
    case "7.1":
      return {
        title: "Mini Project Planning",
        paragraphs: [
          "A small GAIA-style capstone should be scoped to what you can finish in a few sessions, not months.",
          "Define the problem, the user, and the smallest set of features that prove the idea (for example: track lessons, add notes, show progress).",
          "Write success criteria so you know when to stop polishing (for example: can add a note, can view history, can mark complete).",
          "Planning prevents burnout: a clear checklist lets you see progress even when energy is low.",
        ],
      };
    case "7.2":
      return {
        title: "Building the Simple App",
        paragraphs: [
          "Start with a walking skeleton: routes exist, components render, even if they use placeholder data.",
          "Build vertical slices: pick one feature and take it from UI to data instead of half-building everything.",
          "Commit small and often. Each commit should keep the app runnable.",
          "Use fake data first, then swap in real APIs or Supabase once the flow feels right.",
        ],
      };
    case "7.3":
      return {
        title: "Polishing UX and UI",
        paragraphs: [
          "Polish is about states: loading, empty, error, and success. Users should never wonder what happened.",
          "Add small touches like focus styles, accessible labels, and responsive layouts to make the app feel intentional.",
          "Trim wording until the copy is clear and friendly. Short labels beat long paragraphs inside buttons.",
          "In GAIA, polish means the tool feels trustworthy even if the feature set is small.",
        ],
      };
    case "7.4":
      return {
        title: "Connecting the Project into GAIA",
        paragraphs: [
          "Integration means routing, storage, and data fit with the rest of GAIA: URLs, local storage keys, and Supabase tables align.",
          "Link your app from existing navigation (for example from /apollo/academy or /dashboard) so it is discoverable.",
          "Map where data lives: what should stay local, what should sync to Supabase, and how auth ties in.",
          "Document the integration so future you can maintain it: config values, env vars, and storage keys.",
        ],
      };
    default:
      return null;
  }
}

export function getCapstoneQuiz(lessonCode: string): QuizConfig | null {
  switch (lessonCode) {
    case "7.1":
      return {
        id: "quiz-7-1",
        title: "Check your understanding of planning",
        questions: [
          {
            id: "q1",
            prompt: "What should you do first when planning the capstone?",
            options: [
              { id: "q1-a", label: "Implement every feature you can think of" },
              { id: "q1-b", label: "Define a tiny scope, user, and success criteria" },
              { id: "q1-c", label: "Buy new hardware" },
              { id: "q1-d", label: "Skip planning and start coding" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "A small, explicit scope keeps the project finishable and keeps you motivated.",
          },
          {
            id: "q2",
            prompt: "What does success criteria do for you?",
            options: [
              { id: "q2-a", label: "Nothing; they are optional" },
              { id: "q2-b", label: "They tell you when to stop polishing and ship" },
              { id: "q2-c", label: "They increase the scope" },
              { id: "q2-d", label: "They replace testing" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "Success criteria make the finish line clear so you can ship instead of drifting forever.",
          },
          {
            id: "q3",
            prompt: "Why pick GAIA-style problems for the capstone?",
            options: [
              { id: "q3-a", label: "To avoid learning anything new" },
              { id: "q3-b", label: "So the project connects to your real goals and you can reuse it later" },
              { id: "q3-c", label: "Because other domains are illegal" },
              { id: "q3-d", label: "It makes the app slower" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Building something aligned with GAIA ensures the effort carries forward into real tools you need.",
          },
        ],
      };
    case "7.2":
      return {
        id: "quiz-7-2",
        title: "Check your understanding of building",
        questions: [
          {
            id: "q1",
            prompt: "What is a walking skeleton?",
            options: [
              { id: "q1-a", label: "A Halloween decoration" },
              { id: "q1-b", label: "A thin version of the app that runs end-to-end with placeholders" },
              { id: "q1-c", label: "A database diagram" },
              { id: "q1-d", label: "A CSS file" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "A walking skeleton proves the wiring works end-to-end, even with placeholder data.",
          },
          {
            id: "q2",
            prompt: "Why build vertical slices?",
            options: [
              { id: "q2-a", label: "To redesign the whole system before coding" },
              { id: "q2-b", label: "To finish one feature completely instead of half-building many" },
              { id: "q2-c", label: "To avoid writing tests" },
              { id: "q2-d", label: "Because horizontal slices are banned" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "Vertical slices produce usable features faster and reduce the risk of unfinished work everywhere.",
          },
          {
            id: "q3",
            prompt: "Why commit small and often?",
            options: [
              { id: "q3-a", label: "It makes the repo huge" },
              { id: "q3-b", label: "Small commits are easier to review and revert if needed" },
              { id: "q3-c", label: "It is required by Supabase" },
              { id: "q3-d", label: "Large commits are illegal" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Frequent commits keep history clear and make recovery easy if something breaks.",
          },
        ],
      };
    case "7.3":
      return {
        id: "quiz-7-3",
        title: "Check your understanding of polish",
        questions: [
          {
            id: "q1",
            prompt: "Which states should polished screens usually handle?",
            options: [
              { id: "q1-a", label: "Only success" },
              { id: "q1-b", label: "Loading, empty, error, and success" },
              { id: "q1-c", label: "Only error" },
              { id: "q1-d", label: "Only loading" },
            ],
            correctOptionId: "q1-b",
            explanation:
              "Good UX covers the full lifecycle so users know what is happening at every step.",
          },
          {
            id: "q2",
            prompt: "Why do focus styles matter?",
            options: [
              { id: "q2-a", label: "They slow down the app" },
              { id: "q2-b", label: "They help keyboard users know where they are and improve accessibility" },
              { id: "q2-c", label: "They are only for decoration" },
              { id: "q2-d", label: "They replace validation" },
            ],
            correctOptionId: "q2-b",
            explanation:
              "Visible focus makes the app usable without a mouse and signals interactive elements.",
          },
          {
            id: "q3",
            prompt: "What is one hallmark of clear copy?",
            options: [
              { id: "q3-a", label: "Long, formal sentences" },
              { id: "q3-b", label: "Short labels that say exactly what happens" },
              { id: "q3-c", label: "Using jargon everywhere" },
              { id: "q3-d", label: "Hiding actions behind icons" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Concise, direct wording makes the UI feel confident and understandable.",
          },
        ],
      };
    case "7.4":
      return {
        id: "quiz-7-4",
        title: "Check your understanding of integration",
        questions: [
          {
            id: "q1",
            prompt: "What should you align when integrating into GAIA?",
            options: [
              { id: "q1-a", label: "Route patterns, storage keys, and data models" },
              { id: "q1-b", label: "Only CSS colors" },
              { id: "q1-c", label: "Nothing; integration is automatic" },
              { id: "q1-d", label: "Just the README" },
            ],
            correctOptionId: "q1-a",
            explanation:
              "Consistent routes and storage keys make the app feel native and avoid collisions.",
          },
          {
            id: "q2",
            prompt: "Why link your capstone from existing navigation?",
            options: [
              { id: "q2-a", label: "So users can actually find and use it" },
              { id: "q2-b", label: "Links slow down Supabase" },
              { id: "q2-c", label: "Navigation is optional" },
              { id: "q2-d", label: "Links break local storage" },
            ],
            correctOptionId: "q2-a",
            explanation:
              "Discoverability is part of integration; a hidden tool might as well not exist.",
          },
          {
            id: "q3",
            prompt: "What should you document when integrating?",
            options: [
              { id: "q3-a", label: "Nothing; code is enough" },
              { id: "q3-b", label: "Routes, env vars, storage keys, and data flow" },
              { id: "q3-c", label: "Only screenshots" },
              { id: "q3-d", label: "Keyboard shortcuts only" },
            ],
            correctOptionId: "q3-b",
            explanation:
              "Documentation keeps future-you oriented when you return to maintain or extend the feature.",
          },
        ],
      };
    default:
      return null;
  }
}

export function getCapstonePractice(lessonCode: string): PracticePrompt | null {
  switch (lessonCode) {
    case "7.1":
      return {
        title: "Write a one-page project plan",
        description:
          "Draft a short plan that keeps the capstone small and realistic.",
        instructions: [
          "Describe the problem, user, and the smallest feature set (3-5 bullets).",
          "Write success criteria and a target deadline for a first version.",
          "List your constraints (time per day, tools, dependencies) and how you will handle them.",
        ],
      };
    case "7.2":
      return {
        title: "Outline vertical slices",
        description:
          "Plan the order you will build features so the app is usable quickly.",
        instructions: [
          "List 3-4 vertical slices (for example: render list with mock data; add form; persist to Supabase; add filtering).",
          "For each slice, name the components and data flow you will touch.",
          "Note what can be stubbed at first and what must be real before shipping.",
        ],
      };
    case "7.3":
      return {
        title: "Create a polish checklist",
        description:
          "Write the exact UX/UI touches you will add before calling the app done.",
        instructions: [
          "Include states for loading, empty, error, and success for your main screens.",
          "Add accessibility touches (focus styles, aria labels, readable contrast) and responsive notes.",
          "List copy or microcopy improvements you will make (button labels, helper text).",
        ],
      };
    case "7.4":
      return {
        title: "Document integration into GAIA",
        description:
          "Explain how your capstone plugs into routes, storage, and data.",
        instructions: [
          "State the routes you will add (for example /apollo/capstone or /labs/capstone).",
          "List local storage keys or Supabase tables you will use so they do not clash with existing ones.",
          "Describe how users reach the feature from existing navigation and where you will add links or buttons.",
        ],
      };
    default:
      return null;
  }
}

export function validateCapstonePractice(
  lessonCode: string,
  content: string
): PracticeCheckResult | null {
  const src = content.toLowerCase();

  if (lessonCode === "7.1") {
    const required = ["scope", "success", "deadline"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Include scope, success criteria, and a deadline so the plan is actionable. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "7.2") {
    const required = ["slice", "component", "data"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Show vertical slices with components and data flow. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "7.3") {
    const required = ["loading", "empty", "error", "focus"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Polish checklist should mention states (loading/empty/error) and focus/accessibility. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  if (lessonCode === "7.4") {
    const required = ["route", "storage", "link"];
    const missing = required.filter((snippet) => !src.includes(snippet));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Integration notes should mention routes, storage keys/tables, and how users link to it. Missing: " +
          missing.join(", "),
      };
    }
    return { ok: true };
  }

  return null;
}
