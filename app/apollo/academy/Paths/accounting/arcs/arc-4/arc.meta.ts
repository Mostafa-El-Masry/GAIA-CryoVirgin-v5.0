import type { ArcDefinition, LessonDefinition } from "../../../types";

const lessons: LessonDefinition[] = [
  { id: "acc-4-1", code: "4.1", title: "Variance Analysis Basics", status: "active" },
  { id: "acc-4-2", code: "4.2", title: "Margins and Key Ratios", status: "active" },
  { id: "acc-4-3", code: "4.3", title: "Year-End Adjustments and Provisions", status: "active" },
  { id: "acc-4-4", code: "4.4", title: "Accruals and Cut-off", status: "active" },
  { id: "acc-4-5", code: "4.5", title: "Explaining Numbers to Non-Accountants", status: "active" },
  { id: "acc-4-6", code: "4.6", title: "Handling Questions and Pressure in Reviews", status: "active" },
];

export const arc4: ArcDefinition = {
  id: "accounting-arc-4",
  label: "4",
  title: "Analysis, Closing & Explaining Numbers",
  description: "Do basic variance analysis, handle closing steps, and explain numbers simply to non-accountants.",
  lessons,
};
