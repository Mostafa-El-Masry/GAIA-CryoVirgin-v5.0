import { readJSON, writeJSON } from "@/lib/user-storage";

const STORAGE_KEY = "wealth_bank_rates_v1";
const BANK_RATE_BASE_YEAR = 2025;
const BANK_RATE_BASE_PERCENT = 17;
const MIN_ANNUAL_RATE = 10;

export type YearRate = { year: number; rate: number };

export function defaultRates(): YearRate[] {
  return Array.from({ length: 5 }, (_, i) => {
    const year = BANK_RATE_BASE_YEAR + i;
    const drop = Math.max(0, year - BANK_RATE_BASE_YEAR);
    const rate = Math.max(MIN_ANNUAL_RATE, BANK_RATE_BASE_PERCENT - drop);
    return { year, rate };
  });
}

export function getStoredRates(): YearRate[] | null {
  try {
    return readJSON<YearRate[] | null>(STORAGE_KEY, null);
  } catch {
    return null;
  }
}

export function loadRates(): YearRate[] {
  const stored = getStoredRates();
  if (Array.isArray(stored) && stored.length > 0) return stored;
  return defaultRates();
}

export function saveRates(rates: YearRate[]) {
  writeJSON(STORAGE_KEY, rates);
}

export function bankRateForYear(year: number): number {
  const rates = loadRates();
  const found = rates.find((r) => r.year === year);
  if (found) return found.rate;
  const drop = Math.max(0, year - BANK_RATE_BASE_YEAR);
  return Math.max(MIN_ANNUAL_RATE, BANK_RATE_BASE_PERCENT - drop);
}
