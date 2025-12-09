import type { LessonContentData } from "../../../../lesson/lessonContent";

export const accountingLesson11: LessonContentData = {
  study: {
    title: "Accounting Equation & Double-Entry Logic",
    videoUrl: "https://www.youtube.com/watch?v=EqkZPTdcFKg",
    paragraphs: [
      "The accounting equation (Assets = Liabilities + Equity) is the anchor for every report you will build. Double-entry bookkeeping exists to keep this equation in balance after every transaction.",
      "Debits and credits are just directions: assets and expenses increase with debits; liabilities, equity, and revenue increase with credits. Each journal entry must net to zero so the equation holds.",
      "Typical flows: paying rent reduces cash (credit) and increases expense (debit); taking a loan increases cash (debit) and increases liabilities (credit). Think in pairs: what goes up, what goes down?",
      "GAIA Accounts uses this same logic behind the scenes. When you wire a company, every import (sales, payroll, call center) ultimately feeds balanced entries into Assets, Liabilities, and Equity.",
      "For this lesson, focus on (1) writing the equation from memory, (2) mapping five real transactions from your day job to debit/credit pairs, and (3) noting which side of the equation each one touches.",
    ],
  },
};
