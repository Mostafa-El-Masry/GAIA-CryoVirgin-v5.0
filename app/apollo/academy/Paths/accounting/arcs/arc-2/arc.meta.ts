import type { ArcDefinition, LessonDefinition } from "../../../types";

const lessons: LessonDefinition[] = [
  { id: "acc-2-1", code: "2.1", title: "Balance Sheet Structure and Logic", status: "active" },
  { id: "acc-2-2", code: "2.2", title: "Income Statement Structure and Logic", status: "active" },
  { id: "acc-2-3", code: "2.3", title: "Cash Flow Basics", status: "active" },
  { id: "acc-2-4", code: "2.4", title: "Linking Balance Sheet and P&L", status: "active" },
  { id: "acc-2-5", code: "2.5", title: "Common Statement Mistakes and How to Spot Them", status: "active" },
];

export const arc2: ArcDefinition = {
  id: "accounting-arc-2",
  label: "2",
  title: "Financial Statements with Confidence",
  description: "Refresh the balance sheet, income statement, and cash flow, and connect each line to real activity.",
  lessons,
};
