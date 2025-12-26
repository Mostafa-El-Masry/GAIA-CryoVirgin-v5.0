"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useWealthUnlocks } from "../hooks/useWealthUnlocks";
import type { WealthInstrument, WealthState } from "../lib/types";
import { loadWealthStateWithRemote } from "../lib/wealthStore";
import {
  estimateMonthlyInterest,
  estimateTotalInterestOverHorizon,
  instrumentEndMonth,
  monthLabel,
} from "../lib/projections";
import { getTodayInKuwait } from "../lib/summary";

const HORIZON_OPTIONS = [12, 24, 36] as const;
const BIRTH_DATE_UTC = new Date(Date.UTC(1991, 7, 10));
const MIN_ANNUAL_RATE = 10;
const REINVEST_STEP = 1000;

const surface = "wealth-surface text-[var(--gaia-text-default)]";

function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateAge(today: Date, birthDate: Date): number {
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const hasBirthdayPassed =
    today.getUTCMonth() > birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() >= birthDate.getUTCDate());
  if (!hasBirthdayPassed) {
    age -= 1;
  }
  return Math.max(0, age);
}

type AgeProjectionRow = {
  year: number;
  age: number;
  startBalance: number;
  deposit: number;
  depositYear: number;
  revenue: number;
  endBalance: number;
  rate: number;
  uninvested: number;
  months: {
    month: string;
    age: number;
    startBalance: number;
    deposit: number;
    depositYear: number;
    revenue: number;
    endBalance: number;
    rate: number;
    uninvested: number;
  }[];
};

type ProjectionColumnKey =
  | "year"
  | "age"
  | "startBalance"
  | "deposit"
  | "depositYear"
  | "revenue"
  | "endBalance"
  | "rate"
  | "uninvested";

const PROJECTION_COLUMNS: ProjectionColumnKey[] = [
  "year",
  "age",
  "startBalance",
  "deposit",
  "depositYear",
  "revenue",
  "endBalance",
  "rate",
  "uninvested",
];

const PROJECTION_COLUMN_LABELS: Record<ProjectionColumnKey, string> = {
  year: "Year",
  age: "Age",
  startBalance: "Starting balance",
  deposit: "Deposit",
  depositYear: "Deposit per year",
  revenue: "Revenue",
  endBalance: "Ending balance",
  rate: "Rate",
  uninvested: "Uninvested revenue",
};

const PROJECTION_COLUMN_WIDTHS: Record<ProjectionColumnKey, string> = {
  year: "64px",
  age: "54px",
  startBalance: "120px",
  deposit: "120px",
  depositYear: "130px",
  revenue: "110px",
  endBalance: "120px",
  rate: "70px",
  uninvested: "130px",
};

export default function WealthProjectionsPage() {
  const { canAccess, stage, totalLessonsCompleted } = useWealthUnlocks();
  if (!canAccess("projections")) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-slate-100">
        <section className={`${surface} p-8`}>
          <h1 className="text-xl font-semibold text-white">Future projections locked</h1>
          <p className="mt-2 text-sm text-slate-300">
            Complete more Academy lessons in Apollo to unlock this part of Wealth.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Lessons completed: <span className="font-semibold text-white">{totalLessonsCompleted}</span>{" "}
            - Wealth stage <span className="font-semibold text-white">{stage}</span>/5
          </p>
        </section>
      </main>
    );
  }

  const [state, setState] = useState<WealthState | null>(null);
  const [horizon, setHorizon] = useState<(typeof HORIZON_OPTIONS)[number]>(12);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [collapsingYear, setCollapsingYear] = useState<number | null>(null);
  const [projectionColumns, setProjectionColumns] =
    useState<ProjectionColumnKey[]>(PROJECTION_COLUMNS);
  const [draggingColumn, setDraggingColumn] =
    useState<ProjectionColumnKey | null>(null);
  const [dragOverColumn, setDragOverColumn] =
    useState<ProjectionColumnKey | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const s = await loadWealthStateWithRemote();
      if (!cancelled) {
        setState(s);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const today = getTodayInKuwait();
  const instruments = state?.instruments ?? [];
  const projectionCurrency =
    state?.accounts.find((acc) => acc.isPrimary)?.currency ||
    instruments[0]?.currency ||
    "KWD";
  const columnCount = projectionColumns.length;
  const ageProjectionRows = useMemo(() => {
    if (instruments.length === 0) return [] as AgeProjectionRow[];
    const todayDate = new Date(`${today}T00:00:00Z`);
    const currentAge = calculateAge(todayDate, BIRTH_DATE_UTC);
    if (currentAge >= 60) return [] as AgeProjectionRow[];

    let baseRateWeighted = 0;
    let totalPrincipal = 0;
    for (const inst of instruments) {
      const principal = Number(inst.principal) || 0;
      const baseRate = Number(inst.annualRatePercent) || 0;
      if (principal <= 0) continue;
      totalPrincipal += principal;
      baseRateWeighted += principal * baseRate;
    }
    if (totalPrincipal <= 0) return [] as AgeProjectionRow[];
    const baseRate = baseRateWeighted / totalPrincipal;
    let principal = totalPrincipal;
    let reinvestBucket = 0;

    const startDate = new Date(
      Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1),
    );
    const endDate = new Date(
      Date.UTC(BIRTH_DATE_UTC.getUTCFullYear() + 60, BIRTH_DATE_UTC.getUTCMonth(), 1),
    );
    const rowsByYear = new Map<number, AgeProjectionRow>();

    for (
      let cursor = new Date(startDate), monthIndex = 0;
      cursor <= endDate;
      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1)),
        monthIndex += 1
    ) {
      const year = cursor.getUTCFullYear();
      const yearOffset = year - todayDate.getUTCFullYear();
      const effectiveRate = Math.max(MIN_ANNUAL_RATE, baseRate - yearOffset);
      const monthLabel = cursor.toLocaleDateString("en-US", { month: "short" });
      const monthAge = calculateAge(cursor, BIRTH_DATE_UTC);
      const startBalance = principal + reinvestBucket;
      const monthlyRevenue =
        monthIndex === 0 ? 0 : (principal * effectiveRate) / 100 / 12;
      const bucketTotal = reinvestBucket + monthlyRevenue;
      const investable = Math.floor(bucketTotal / REINVEST_STEP) * REINVEST_STEP;
      reinvestBucket = bucketTotal - investable;
      principal += investable;
      const endBalance = principal + reinvestBucket;

      const existing = rowsByYear.get(year);
      if (!existing) {
        rowsByYear.set(year, {
          year,
          age: calculateAge(new Date(Date.UTC(year, 11, 31)), BIRTH_DATE_UTC),
          startBalance,
          deposit: principal,
          depositYear: investable,
          revenue: monthlyRevenue,
          endBalance,
          rate: effectiveRate,
          uninvested: reinvestBucket,
          months: [
            {
              month: monthLabel,
              age: monthAge,
              startBalance,
              deposit: principal,
              depositYear: investable,
              revenue: monthlyRevenue,
              endBalance,
              rate: effectiveRate,
              uninvested: reinvestBucket,
            },
          ],
        });
      } else {
        existing.deposit = principal;
        existing.depositYear += investable;
        existing.revenue += monthlyRevenue;
        existing.endBalance = endBalance;
        existing.rate = effectiveRate;
        existing.uninvested = reinvestBucket;
        existing.months.push({
          month: monthLabel,
          age: monthAge,
          startBalance,
          deposit: principal,
          depositYear: investable,
          revenue: monthlyRevenue,
          endBalance,
          rate: effectiveRate,
          uninvested: reinvestBucket,
        });
      }
    }

    return Array.from(rowsByYear.values()).map((row) => ({
      ...row,
      revenue: row.months.length ? row.revenue / row.months.length : 0,
    }));
  }, [instruments, today]);

  const byCurrency = useMemo(() => {
    const map = new Map<
      string,
      {
        monthlyInterest: number;
        totalOverHorizon: number;
      }
    >();
    for (const inst of instruments) {
      const monthly = estimateMonthlyInterest(inst);
      const total = estimateTotalInterestOverHorizon(inst, horizon, today);
      const entry = map.get(inst.currency) ?? {
        monthlyInterest: 0,
        totalOverHorizon: 0,
      };
      entry.monthlyInterest += monthly;
      entry.totalOverHorizon += total;
      map.set(inst.currency, entry);
    }
    return map;
  }, [instruments, horizon, today]);

  if (!state) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-slate-100">
        <section className={`${surface} p-6 text-sm text-slate-300`}>
          Loading your investments and projections...
        </section>
      </main>
    );
  }

  const getCellClasses = (
    key: ProjectionColumnKey,
    isMonth: boolean,
  ): string => {
    const align = key === "year" || key === "age" ? "" : "text-right";
    const base = isMonth ? "py-2" : "py-3";
    if (isMonth) {
      const monthBg = "bg-blue-600/10";
      if (key === "year") {
        return `${base} pr-2 pl-4 text-[11px] text-black ${monthBg} ${align}`.trim();
      }
      if (key === "age") {
        return `${base} px-2 text-[11px] text-black ${monthBg} ${align}`.trim();
      }
      if (key === "deposit" || key === "revenue" || key === "endBalance") {
        return `${base} px-2 text-[11px] font-semibold text-black ${monthBg} ${align}`.trim();
      }
      return `${base} px-2 text-[11px] text-black ${monthBg} ${align}`.trim();
    }

    const hoverBg = "group-hover:bg-blue-600/12";
    if (key === "year") {
      return `${base} pr-2 text-[11px] text-black ${hoverBg}`.trim();
    }
    if (key === "age") {
      return `${base} px-2 text-[11px] text-black ${hoverBg}`.trim();
    }
    if (key === "deposit" || key === "revenue" || key === "endBalance") {
      return `${base} px-2 text-[11px] font-semibold text-black ${hoverBg} ${align}`.trim();
    }
    return `${base} px-2 text-[11px] text-black ${hoverBg} ${align}`.trim();
  };

  const renderYearCell = (key: ProjectionColumnKey, row: AgeProjectionRow) => {
    switch (key) {
      case "year":
        return row.year;
      case "age":
        return row.age;
      case "startBalance":
        return formatCurrency(row.startBalance, projectionCurrency);
      case "deposit":
        return formatCurrency(row.deposit, projectionCurrency);
      case "depositYear":
        return formatCurrency(row.depositYear, projectionCurrency);
      case "revenue":
        return formatCurrency(row.revenue, projectionCurrency);
      case "endBalance":
        return formatCurrency(row.endBalance, projectionCurrency);
      case "rate":
        return `${row.rate.toFixed(2)}%`;
      case "uninvested":
        return formatCurrency(row.uninvested, projectionCurrency);
      default:
        return "";
    }
  };

  const renderMonthCell = (
    key: ProjectionColumnKey,
    month: AgeProjectionRow["months"][number],
  ) => {
    switch (key) {
      case "year":
        return month.month;
      case "age":
        return month.age;
      case "startBalance":
        return formatCurrency(month.startBalance, projectionCurrency);
      case "deposit":
        return formatCurrency(month.deposit, projectionCurrency);
      case "depositYear":
        return formatCurrency(month.depositYear, projectionCurrency);
      case "revenue":
        return formatCurrency(month.revenue, projectionCurrency);
      case "endBalance":
        return formatCurrency(month.endBalance, projectionCurrency);
      case "rate":
        return `${month.rate.toFixed(2)}%`;
      case "uninvested":
        return formatCurrency(month.uninvested, projectionCurrency);
      default:
        return "";
    }
  };

  const handleColumnDrop = (
    sourceKey: ProjectionColumnKey,
    targetKey: ProjectionColumnKey,
  ) => {
    if (sourceKey === targetKey) return;
    setProjectionColumns((prev) => {
      const next = prev.filter((key) => key !== sourceKey);
      const targetIndex = next.indexOf(targetKey);
      next.splice(targetIndex, 0, sourceKey);
      return next;
    });
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-slate-100">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/80">
            Wall Street Drive
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Future projections</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Rough, calm projections of your interest income if nothing changes. No step-downs or
            complex compounding - just a simple view over the next 12-36 months.
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 md:mt-0">
          <label className="text-xs text-slate-300">
            Horizon
            <select
              className="ml-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-white shadow-inner shadow-black/30"
              value={horizon}
              onChange={(e) =>
                setHorizon(parseInt(e.target.value, 10) as 12 | 24 | 36)
              }
            >
              {HORIZON_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {h} months
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Simple, on-purpose rough
          </h2>
          <p className="mt-2 text-xs text-slate-300">
            These projections assume your principal, rates, and payout rules stay the same.
            They&apos;re meant for a feeling, not a contract.
          </p>
        </article>

        <article className={`${surface} p-4 md:col-span-2`}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Interest by currency
          </h3>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {Array.from(byCurrency.entries()).map(([currency, agg]) => (
              <div
                key={currency}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {currency}
                  </span>
                  <span className="text-[11px] text-slate-500">Horizon: {horizon} months</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(agg.monthlyInterest, currency)} / month
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Roughly{" "}
                  <span className="font-semibold text-white">
                    {formatCurrency(agg.totalOverHorizon, currency)}
                  </span>{" "}
                  total interest over the next {horizon} months.
                </p>
              </div>
            ))}
            {byCurrency.size === 0 && (
              <p className="text-xs text-slate-400">
                No investments defined yet. Add certificates first, then revisit projections.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className={`${surface} p-5 md:p-6`}>
        <h2 className="text-sm font-semibold text-white">Investment breakdown</h2>
        <p className="mt-1 text-xs text-slate-400">
          For each investment, see the approximate monthly interest and how much it could pay you
          over the selected horizon, within its term.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Name</th>
                <th className="px-3 py-2">Currency</th>
                <th className="px-3 py-2 text-right">Principal</th>
                <th className="px-3 py-2 text-right">Annual rate</th>
                <th className="px-3 py-2 text-right">Term</th>
                <th className="px-3 py-2 text-right">Monthly interest</th>
                <th className="px-3 py-2 text-right">Interest over horizon</th>
              </tr>
            </thead>
            <tbody>
              {instruments.map((inst: WealthInstrument) => {
                const monthly = estimateMonthlyInterest(inst);
                const total = estimateTotalInterestOverHorizon(inst, horizon, today);
                const endMonth = instrumentEndMonth(inst);
                return (
                  <tr key={inst.id} className="border-b border-slate-800 last:border-b-0">
                    <td className="py-2 pr-3 align-top">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{inst.name}</span>
                        <span className="mt-0.5 text-[11px] text-slate-500">
                          Ends around {monthLabel(endMonth)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] text-slate-400">
                      {inst.currency}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-white">
                      {formatCurrency(inst.principal, inst.currency)}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] text-slate-300">
                      {inst.annualRatePercent.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] text-slate-300">
                      {inst.termMonths} m
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-white">
                      {formatCurrency(monthly, inst.currency)}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-white">
                      {formatCurrency(total, inst.currency)}
                    </td>
                  </tr>
                );
              })}
              {instruments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-xs text-slate-400">
                    No investments defined yet, so there is nothing to project yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">
          Later versions of GAIA can add more precise formulas, step-down rules, and multi-currency
          conversions. For Awakening, the goal is a gentle, human-scale feeling of what your current
          certificates are doing for you.
        </p>
      </section>

      <section className={`${surface} p-5 md:p-6`}>
        <h2 className="text-sm font-semibold text-white">Age projection to 60</h2>
        <p className="mt-1 text-xs text-slate-400">
          Assumes certificates renew every 3 years, principal stays constant, and the annual rate
          drops 1% per year until it floors at 10%. Revenue is reinvested in chunks of{" "}
          {REINVEST_STEP}.
        </p>
        <div className="mt-4 overflow-x-hidden">
          <table className="min-w-full table-fixed border-separate border-spacing-y-2 text-left text-xs text-black">
            <colgroup>
              {projectionColumns.map((key) => (
                <col key={key} style={{ width: PROJECTION_COLUMN_WIDTHS[key] }} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-black">
                {projectionColumns.map((key) => {
                  const isRight =
                    key !== "year" && key !== "age";
                  return (
                    <th
                      key={key}
                      draggable
                      onDragStart={(event) => {
                        setDraggingColumn(key);
                        event.dataTransfer.setData("text/plain", key);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverColumn(key);
                      }}
                      onDragLeave={() => setDragOverColumn(null)}
                      onDrop={(event) => {
                        event.preventDefault();
                        const source =
                          draggingColumn ||
                          (event.dataTransfer.getData("text/plain") as ProjectionColumnKey);
                        if (source) {
                          handleColumnDrop(source, key);
                        }
                        setDraggingColumn(null);
                        setDragOverColumn(null);
                      }}
                      onDragEnd={() => {
                        setDraggingColumn(null);
                        setDragOverColumn(null);
                      }}
                      className={`py-2 ${isRight ? "px-2 text-right" : "pr-2"} ${
                        dragOverColumn === key ? "bg-blue-600/10" : ""
                      }`}
                      title="Drag to reorder columns"
                    >
                      {PROJECTION_COLUMN_LABELS[key]}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {ageProjectionRows.map((row) => (
                <Fragment key={row.year}>
                  <tr
                    className="group cursor-pointer text-black transition"
                    onClick={() =>
                      setExpandedYear((prev) => {
                        if (prev === row.year) {
                          setCollapsingYear(row.year);
                          setTimeout(() => setCollapsingYear(null), 700);
                          return null;
                        }
                        return row.year;
                      })
                    }
                  >
                    {projectionColumns.map((key, idx) => {
                      const rounding =
                        idx === 0
                          ? "rounded-l-xl"
                          : idx === projectionColumns.length - 1
                          ? "rounded-r-xl"
                          : "";
                      return (
                        <td
                          key={key}
                          className={`${getCellClasses(key, false)} ${rounding}`}
                        >
                          {renderYearCell(key, row)}
                        </td>
                      );
                    })}
                  </tr>
                  {expandedYear === row.year || collapsingYear === row.year ? (
                    <tr className="border-b border-slate-800">
                      <td colSpan={columnCount} className="p-0">
                        <div
                          className={`overflow-hidden transition-[max-height,opacity] duration-[700ms] ease-in-out ${
                            expandedYear === row.year && collapsingYear !== row.year
                              ? "max-h-[720px] opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <table className="w-full table-fixed border-separate border-spacing-y-1 text-left text-xs text-black">
                            <colgroup>
                              {projectionColumns.map((key) => (
                                <col
                                  key={key}
                                  style={{ width: PROJECTION_COLUMN_WIDTHS[key] }}
                                />
                              ))}
                            </colgroup>
                            <tbody>
                              {row.months.map((month, idx) => (
                                <tr
                                  key={`${row.year}-${idx}-${month.month}`}
                                  className="border-b border-slate-800 text-slate-300"
                                >
                                  {projectionColumns.map((key, colIdx) => {
                                    const rounding =
                                      colIdx === 0
                                        ? "rounded-l-xl"
                                        : colIdx === projectionColumns.length - 1
                                        ? "rounded-r-xl"
                                        : "";
                                    return (
                                      <td
                                        key={key}
                                        className={`${getCellClasses(key, true)} ${rounding}`}
                                      >
                                        {renderMonthCell(key, month)}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
              {ageProjectionRows.length === 0 && (
                <tr>
                  <td colSpan={columnCount} className="py-4 text-center text-xs text-slate-400">
                    No investment data to project by age yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
