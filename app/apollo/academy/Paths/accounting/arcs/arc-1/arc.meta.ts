import type { ArcDefinition, LessonDefinition } from "../../../types";

const lessons: LessonDefinition[] = [
  {
    id: "acc-1-1",
    code: "1.1",
    title: "Accounting Equation & Double-Entry Logic",
    status: "active",
  },
  {
    id: "acc-1-2",
    code: "1.2",
    title: "Debits & Credits in Practice",
    status: "active",
  },
  {
    id: "acc-1-3",
    code: "1.3",
    title: "Chart of Accounts and Account Types",
    status: "active",
  },
  {
    id: "acc-1-4",
    code: "1.4",
    title: "Journals, Ledgers, and Posting Flow",
    status: "active",
  },
  {
    id: "acc-1-5",
    code: "1.5",
    title: "Trial Balance and Basic Self-Checks",
    status: "active",
  },
];

export const arc1: ArcDefinition = {
  id: "accounting-arc-1",
  label: "1",
  title: "Foundations & Reset",
  description: "Rebuild your base in double-entry, core concepts, and everyday language grounded in your current job.",
  lessons,
};
