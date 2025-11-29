import type { LessonContentData } from "../lesson/lessonContent";

// Placeholder accounting content
// Full accounting lesson content will be added later
const ACCOUNTING_LESSONS: Record<
  string,
  { title: string; description: string }
> = {
  "1.1": {
    title: "Accounting Equation & Double-Entry Logic",
    description:
      "Understand the fundamental accounting equation and how double-entry bookkeeping works.",
  },
  "1.2": {
    title: "Debits & Credits in Practice",
    description:
      "Learn how debits and credits flow through journal entries and practice with real examples.",
  },
  "1.3": {
    title: "Chart of Accounts and Account Types",
    description:
      "Build and understand your chart of accounts to organize all financial transactions.",
  },
  "1.4": {
    title: "Journals, Ledgers, and Posting Flow",
    description:
      "Trace the complete flow from journal entries through to the general ledger.",
  },
  "1.5": {
    title: "Trial Balance and Basic Self-Checks",
    description:
      "Create and verify trial balances to ensure your bookkeeping is in balance.",
  },
  "2.1": {
    title: "Balance Sheet Structure and Logic",
    description:
      "Understand the balance sheet as a snapshot of your financial position.",
  },
  "2.2": {
    title: "Income Statement Structure and Logic",
    description:
      "Read and interpret the income statement to understand your profitability.",
  },
  "2.3": {
    title: "Cash Flow Basics",
    description:
      "Learn the cash flow statement and why cash differs from profit.",
  },
  "2.4": {
    title: "Linking Balance Sheet and P&L",
    description:
      "Connect the three main financial statements and understand their relationships.",
  },
  "2.5": {
    title: "Common Statement Mistakes and How to Spot Them",
    description: "Identify and prevent common errors in financial statements.",
  },
  "3.1": {
    title: "Excel / Sheets Basics for Accounting",
    description: "Master spreadsheets as a tool for accounting work.",
  },
  "3.2": {
    title: "Templates and Schedules for Recurring Work",
    description:
      "Create reusable templates to streamline your monthly processes.",
  },
  "3.3": {
    title: "Importing and Cleaning Data",
    description:
      "Import data from various sources and clean it for accounting use.",
  },
  "3.4": {
    title: "Reconciliations: Bank, Vendors, and Customers",
    description:
      "Master the reconciliation process for all major account categories.",
  },
  "3.5": {
    title: "Monthly Close Checklist",
    description:
      "Build a comprehensive checklist for your monthly close process.",
  },
  "3.6": {
    title: "Documentation and Workpapers",
    description:
      "Create organized documentation to support your accounting work.",
  },
  "4.1": {
    title: "Variance Analysis Basics",
    description: "Analyze differences between actual and budgeted results.",
  },
  "4.2": {
    title: "Margins and Key Ratios",
    description: "Calculate and interpret key financial ratios and margins.",
  },
  "4.3": {
    title: "Year-End Adjustments and Provisions",
    description: "Handle year-end adjustments and accrual entries correctly.",
  },
  "4.4": {
    title: "Accruals and Cut-off",
    description: "Master accrual accounting and period-end cutoff procedures.",
  },
  "4.5": {
    title: "Explaining Numbers to Non-Accountants",
    description: "Develop skills to communicate financial information clearly.",
  },
  "4.6": {
    title: "Handling Questions and Pressure in Reviews",
    description:
      "Prepare for and handle difficult questions about financial results.",
  },
  "5.1": {
    title: "Mapping Your Current Pain Points",
    description: "Identify your biggest challenges in current accounting work.",
  },
  "5.2": {
    title: "Defining Ideal Workflows",
    description: "Design how your ideal accounting workflow would look.",
  },
  "5.3": {
    title: "Designing GAIA Helpers and Checks",
    description: "Conceptualize GAIA features that would help your work.",
  },
  "5.4": {
    title: "Turning Pain Points into Features and Rules",
    description:
      "Transform your needs into concrete GAIA feature requirements.",
  },
};

export function resolveAccountingContent(lessonId: string): LessonContentData {
  // lessonId format: "acc-1-1", "acc-1-2", etc.
  const match = lessonId.match(/acc-(\d+)-(\d+)/);
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

  const lessonInfo = ACCOUNTING_LESSONS[lessonCode];

  if (!lessonInfo) {
    return {
      study: {
        title: "Lesson coming soon",
        paragraphs: [
          "This accounting lesson is planned in your GAIA roadmap but detailed content has not been written yet.",
          "You can use this space to add your own notes and examples from your work until the lesson content arrives.",
        ],
      },
    };
  }

  return {
    study: {
      title: lessonInfo.title,
      paragraphs: [
        lessonInfo.description,
        "Detailed lesson content coming soon. Use this space for your own notes and practice.",
      ],
    },
  };
}
