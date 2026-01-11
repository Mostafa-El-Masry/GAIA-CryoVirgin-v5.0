export type DayKey = string; // "YYYY-MM-DD" in Asia/Kuwait
export type MonthKey = string; // "YYYY-MM" in Asia/Kuwait

export type WealthAccountType = "cash" | "certificate" | "investment" | "other";

export interface WealthAccount {
  id: string;
  name: string;
  currency: string;
  type: WealthAccountType;
  currentBalance: number;
  isPrimary?: boolean;
  note?: string;
}

export type WealthFlowKind =
  | "income"
  | "deposit"
  | "investment"
  | "withdrawal"
  | "interest"
  | "expense";

export interface WealthFlow {
  id: string;
  date: DayKey;
  accountId?: string | null;
  instrumentId?: string | null;
  kind: WealthFlowKind;
  amount: number;
  currency: string;
  description?: string;
}

export type PayoutFrequency =
  | "monthly-interest"
  | "quarterly-interest"
  | "semiannual-interest"
  | "annual-interest"
  | "at-maturity";

export interface WealthInstrument {
  id: string;
  reference?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  revenueFrequency?: string | null;
  accountId: string;
  name: string;
  currency: string;
  principal: number;
  startDate: DayKey;
  termMonths: number;
  annualRatePercent: number;
  payoutFrequency: PayoutFrequency;
  autoRenew: boolean;
  note?: string;
}

export interface WealthMonthStory {
  month: MonthKey;
  startingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalIncome: number;
  totalInterest: number;
  totalExpenses: number;
  endingBalance: number;
  netChange: number;
  netChangePercent: number | null;
  story: string;
}

export interface WealthState {
  accounts: WealthAccount[];
  instruments: WealthInstrument[];
  flows: WealthFlow[];
}

export interface WealthOverview extends WealthState {
  today: DayKey;
  totalNetWorth: number;
  totalCash: number;
  totalCertificates: number;
  totalInvestments: number;
  primaryCurrency: string;
  monthStory: WealthMonthStory;
}

// --- Wealth Plans ---

/**
 * Plans are comfort tiers based on savings size and monthly revenue.
 * Thresholds are intentionally simple (minimum savings and monthly revenue).
 */
export interface WealthLevelDefinition {
  id: string;
  name: string;
  shortLabel: string;
  order: number;
  minSavings?: number;
  minMonthlyRevenue?: number;
  description: string;
  survivability?: string;
  allowedEnrichment?: string;
  calendarsUnlocked?: string;
}

export interface WealthLevelsSnapshot {
  levels: WealthLevelDefinition[];
  currentLevelId: string | null;
  nextLevelId: string | null;
  totalSavings: number;
  monthsOfExpensesSaved: number | null;
  monthlyPassiveIncome: number | null;
  estimatedMonthlyExpenses: number | null;
  coveragePercent: number | null;
}
