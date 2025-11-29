export type Lesson = {
  id: string;
  code: string;
  title: string;
  estimate: string;
};

export type Arc = {
  id: string;
  label: string;
  title: string;
  focus: string;
  lessons: Lesson[];
};

const arcs: Arc[] = [
  {
    id: "self-1-basics",
    label: "Arc 1",
    title: "Stabilizing the Basics",
    focus:
      "Sleep, food, basic movement, and very small daily anchors. No perfection — just getting your body and days to a more stable baseline.",
    lessons: [
      {
        id: "self-1-1",
        code: "1.1",
        title: "Mapping Your Current Rhythm (Sleep, Food, Energy)",
        estimate: "Flexible",
      },
      {
        id: "self-1-2",
        code: "1.2",
        title: "Designing One Small Daily Anchor",
        estimate: "Flexible",
      },
      {
        id: "self-1-3",
        code: "1.3",
        title: "Gentle Movement: Walks, Stretching, and Realistic Goals",
        estimate: "Flexible",
      },
      {
        id: "self-1-4",
        code: "1.4",
        title: "Bad Days Protocol: Minimum Baseline to Not Collapse",
        estimate: "Flexible",
      },
    ],
  },
  {
    id: "self-2-voice",
    label: "Arc 2",
    title: "The Inner Voice",
    focus:
      "Notice the inner attacker, separate it from reality, and slowly replace automatic self-hate with more honest, kinder thoughts.",
    lessons: [
      {
        id: "self-2-1",
        code: "2.1",
        title: "Catching the Inner Attacker in Real Sentences",
        estimate: "Flexible",
      },
      {
        id: "self-2-2",
        code: "2.2",
        title: "Separating Facts from Attacks",
        estimate: "Flexible",
      },
      {
        id: "self-2-3",
        code: "2.3",
        title: "Building a More Honest, Kinder Counter-Voice",
        estimate: "Flexible",
      },
      {
        id: "self-2-4",
        code: "2.4",
        title: "Responding to Shame Without Disappearing",
        estimate: "Flexible",
      },
    ],
  },
  {
    id: "self-3-people",
    label: "Arc 3",
    title: "People & Boundaries",
    focus:
      "Understand which relationships drain you and which support you, and practice tiny boundaries so you don&apos;t feel like a toy or a burden.",
    lessons: [
      {
        id: "self-3-1",
        code: "3.1",
        title: "Mapping Draining vs Supportive People",
        estimate: "Flexible",
      },
      {
        id: "self-3-2",
        code: "3.2",
        title: "Tiny Boundaries: Delays, Shorter Calls, Less Explaining",
        estimate: "Flexible",
      },
      {
        id: "self-3-3",
        code: "3.3",
        title: "Guilt vs Responsibility",
        estimate: "Flexible",
      },
      {
        id: "self-3-4",
        code: "3.4",
        title: "Protecting Your Energy Around Family and Work",
        estimate: "Flexible",
      },
    ],
  },
  {
    id: "self-4-meaning",
    label: "Arc 4",
    title: "Meaning & GAIA",
    focus:
      "Use GAIA as a life map instead of a stick to beat yourself with. Connect your studies and work to a bigger story that makes sense.",
    lessons: [
      {
        id: "self-4-1",
        code: "4.1",
        title: "Reframing GAIA: From Self-Attack to Self-Support",
        estimate: "Flexible",
      },
      {
        id: "self-4-2",
        code: "4.2",
        title: "Connecting Study Paths to Real Future Scenarios",
        estimate: "Flexible",
      },
      {
        id: "self-4-3",
        code: "4.3",
        title: "Designing Rituals that Make You Feel Like a Person, Not a Machine",
        estimate: "Flexible",
      },
    ],
  },
  {
    id: "self-5-relapse",
    label: "Arc 5",
    title: "Relapse & Maintenance Plan",
    focus:
      "Design what you&apos;ll do on bad days before they happen: who to talk to, what to avoid, and which tiny steps help you not disappear.",
    lessons: [
      {
        id: "self-5-1",
        code: "5.1",
        title: "Defining Your Early Warning Signs",
        estimate: "Flexible",
      },
      {
        id: "self-5-2",
        code: "5.2",
        title: "Building a Personal Emergency List (People, Actions, Words)",
        estimate: "Flexible",
      },
      {
        id: "self-5-3",
        code: "5.3",
        title: "Review & Adjust: Keeping the Plan Realistic",
        estimate: "Flexible",
      },
    ],
  },
];

export const selfRepairArcs: Arc[] = arcs;

export const totalSelfRepairLessons = selfRepairArcs.reduce(
  (sum, arc) => sum + arc.lessons.length,
  0
);
