import type { DayKey, MonthKey, WealthInstrument } from "./types";
import { getTodayInKuwait } from "./summary";
import { bankRateForYear } from "./bankRates";

function parseDayKey(day: DayKey): {
  year: number;
  month: number;
  day: number;
} {
  const [y, m, d] = day.split("-").map((v) => parseInt(v, 10));
  return {
    year: Number.isFinite(y) ? y : 1970,
    month: Number.isFinite(m) ? m : 1,
    day: Number.isFinite(d) ? d : 1,
  };
}

function toMonthKeyFromDay(day: DayKey): MonthKey {
  return day.slice(0, 7);
}

function monthsBetween(start: DayKey, end: DayKey): number {
  const s = parseDayKey(start);
  const e = parseDayKey(end);
  return (e.year - s.year) * 12 + (e.month - s.month);
}

export function estimateMonthlyInterest(inst: WealthInstrument): number {
  if (!Number.isFinite(inst.principal)) return 0;
  const todayKey = getTodayInKuwait();
  // determine effective annual rate for the current month (considers renewals)
  const baseRate = Number(inst.annualRatePercent) || 0;
  const termMonths = Math.max(0, inst.termMonths || 0);
  if (!inst.startDate || termMonths <= 0) {
    const annualRate = baseRate / 100;
    return inst.principal * (annualRate / 12);
  }
  const elapsed = monthsBetween(inst.startDate, todayKey);
  if (elapsed < 1) {
    const annualRate = baseRate / 100;
    return inst.principal * (annualRate / 12);
  }
  const renewalIndex = Math.floor(elapsed / termMonths);
  if (renewalIndex <= 0) {
    const annualRate = baseRate / 100;
    return inst.principal * (annualRate / 12);
  }
  const start = parseDayKey(inst.startDate);
  const renewalMonths = termMonths * renewalIndex;
  const totalMonths = start.year * 12 + (start.month - 1) + renewalMonths;
  const renewalYear = Math.floor(totalMonths / 12);
  const effAnnual = bankRateForYear(renewalYear) / 100;
  return inst.principal * (effAnnual / 12);
}

export function remainingTermMonths(
  inst: WealthInstrument,
  today?: DayKey
): number {
  const todayKey = today ?? getTodayInKuwait();
  const elapsed = Math.max(0, monthsBetween(inst.startDate, todayKey));
  const remaining = Math.max(0, inst.termMonths - elapsed);
  return remaining;
}

export function estimateTotalInterestOverHorizon(
  inst: WealthInstrument,
  horizonMonths: number,
  today?: DayKey
): number {
  const todayKey = today ?? getTodayInKuwait();
  if (!Number.isFinite(inst.principal)) return 0;
  const elapsed = Math.max(0, monthsBetween(inst.startDate, todayKey));
  const remaining = Math.max(0, inst.termMonths - elapsed);
  const monthsToConsider = Math.max(0, Math.min(remaining, horizonMonths));

  // Sum monthly interest for each month in the horizon, using effective rate per month
  let total = 0;
  for (let m = 0; m < monthsToConsider; m += 1) {
    // compute monthKey for month m from todayKey
    const d = new Date(`${todayKey}T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + m);
    const monthKey = d.toISOString().slice(0, 10);

    // determine effective rate for this month
    const baseRate = Number(inst.annualRatePercent) || 0;
    const termMonths = Math.max(0, inst.termMonths || 0);
    if (!inst.startDate || termMonths <= 0) continue;
    const elapsedMonth = monthsBetween(inst.startDate, monthKey);
    if (elapsedMonth < 1) {
      total += inst.principal * (baseRate / 100 / 12);
      continue;
    }
    const renewalIndex = Math.floor(elapsedMonth / termMonths);
    if (renewalIndex <= 0) {
      total += inst.principal * (baseRate / 100 / 12);
      continue;
    }
    const start = parseDayKey(inst.startDate);
    const renewalMonths = termMonths * renewalIndex;
    const totalMonths = start.year * 12 + (start.month - 1) + renewalMonths;
    const renewalYear = Math.floor(totalMonths / 12);
    const effAnnual = bankRateForYear(renewalYear) / 100;
    total += inst.principal * (effAnnual / 12);
  }
  return total;
}

export function monthLabel(monthKey: MonthKey): string {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = parseInt(yearStr ?? "0", 10);
  const month = parseInt(monthStr ?? "0", 10);
  if (!year || !month) return monthKey;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function instrumentEndMonth(inst: WealthInstrument): MonthKey {
  const start = parseDayKey(inst.startDate);
  const totalMonths = start.year * 12 + (start.month - 1) + inst.termMonths;
  const endYear = Math.floor(totalMonths / 12);
  const endMonth = (totalMonths % 12) + 1;
  const y = String(endYear).padStart(4, "0");
  const m = String(endMonth).padStart(2, "0");
  return `${y}-${m}`;
}
