import type { ArcDefinition, LessonDefinition } from "../../../types";

const lessons: LessonDefinition[] = [
  { id: "acc-3-1", code: "3.1", title: "Excel / Sheets Basics for Accounting", status: "active" },
  { id: "acc-3-2", code: "3.2", title: "Templates and Schedules for Recurring Work", status: "active" },
  { id: "acc-3-3", code: "3.3", title: "Importing and Cleaning Data", status: "active" },
  { id: "acc-3-4", code: "3.4", title: "Reconciliations: Bank, Vendors, and Customers", status: "active" },
  { id: "acc-3-5", code: "3.5", title: "Monthly Close Checklist", status: "active" },
  { id: "acc-3-6", code: "3.6", title: "Documentation and Workpapers", status: "active" },
];

export const arc3: ArcDefinition = {
  id: "accounting-arc-3",
  label: "3",
  title: "Tools, Systems & Clean Data",
  description: "Tame Excel/Sheets and your accounting software with checklists, templates, and routines.",
  lessons,
};
