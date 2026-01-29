"use client";

import { useEffect, useState } from "react";
import { getTodayInKuwait } from "../lib/summary";
import { SEED_FOOD_ITEMS } from "../../health/lib/foodLibrary";

const surface = "wealth-surface text-[var(--gaia-text-default)]";

type FoodStatsRow = {
  id: string;
  label: string;
  currency: string;
  price: number;
  kcal: number;
  countThisMonth: number;
  countAllTime: number;
  estThisMonth: number;
};

type LocalSelectionMap = Record<string, string | undefined>;

const LOCAL_STORAGE_KEY = "gaia-health-food-plan-v1";

function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) return "-";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

const FoodSpendingCard = () => {
  const [rows, setRows] = useState<FoodStatsRow[] | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) {
        setRows(null);
        return;
      }

      const parsed = JSON.parse(raw) as LocalSelectionMap;
      const todayKey = getTodayInKuwait(); // "YYYY-MM-DD"
      const currentMonth = todayKey.slice(0, 7); // "YYYY-MM"

      const countsById: Record<
        string,
        { countThisMonth: number; countAllTime: number }
      > = {};

      for (const [iso, foodId] of Object.entries(parsed)) {
        if (!foodId) continue;
        if (!countsById[foodId]) {
          countsById[foodId] = { countThisMonth: 0, countAllTime: 0 };
        }
        countsById[foodId].countAllTime += 1;
        if (iso.slice(0, 7) === currentMonth) {
          countsById[foodId].countThisMonth += 1;
        }
      }

      const derivedRows: FoodStatsRow[] = SEED_FOOD_ITEMS.map((item) => {
        const counts = countsById[item.id] ?? {
          countThisMonth: 0,
          countAllTime: 0,
        };
        const estThisMonth = counts.countThisMonth * (item.price ?? 0);
        return {
          id: item.id,
          label: item.label,
          currency: item.currency ?? "KWD",
          price: item.price ?? 0,
          kcal: item.kcal ?? 0,
          countThisMonth: counts.countThisMonth,
          countAllTime: counts.countAllTime,
          estThisMonth,
        };
      }).filter((row) => row.countAllTime > 0);

      if (!derivedRows.length) {
        setRows(null);
      } else {
        setRows(derivedRows);
      }
    } catch {
      setRows(null);
    }
  }, []);

  const totalsByCurrency = rows
    ? rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.currency] = (acc[row.currency] ?? 0) + row.estThisMonth;
        return acc;
      }, {})
    : {};

  return (
    <section className={surface + " p-4 md:p-5"}>
      <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
            Health-linked food spending
          </h2>
          <p className="mt-1 text-xs gaia-muted">
            This card reads your{" "}
            <span className="font-semibold">Food Calendar</span> lunches and
            estimates how much you spent on those meals this month, based on the
            seed prices in the Health Food Library.
          </p>
        </div>
        {rows && Object.keys(totalsByCurrency).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] md:mt-0">
            {Object.entries(totalsByCurrency).map(([currency, total]) => (
              <span
                key={currency}
                className="inline-flex items-center rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 font-semibold text-[var(--gaia-text-strong)]"
              >
                This month: {formatCurrency(total, currency)}
              </span>
            ))}
          </div>
        )}
      </header>

      {!rows && (
        <p className="mt-3 text-xs gaia-muted">
          No lunches have been logged yet from the Food Calendar, or they do not
          use the current seed Food Library items. Once you start selecting
          lunches there, GAIA will show an estimated monthly cost here.
        </p>
      )}

      {rows && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-[var(--gaia-border-soft)] text-[var(--gaia-text-muted)]">
                <th className="pb-2 pr-3">Food</th>
                <th className="pb-2 pr-3">kcal</th>
                <th className="pb-2 pr-3">Price / serving</th>
                <th className="pb-2 pr-3">Times this month</th>
                <th className="pb-2 pr-3">Est. this month</th>
                <th className="pb-2 pr-3">Total logged</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--gaia-border-soft)] last:border-0"
                >
                  <td className="py-1 pr-3 text-[var(--gaia-text-strong)]">
                    {row.label}
                  </td>
                  <td className="py-1 pr-3">{row.kcal}</td>
                  <td className="py-1 pr-3">
                    {formatCurrency(row.price, row.currency)}
                  </td>
                  <td className="py-1 pr-3">{row.countThisMonth}</td>
                  <td className="py-1 pr-3">
                    {formatCurrency(row.estThisMonth, row.currency)}
                  </td>
                  <td className="py-1 pr-3">{row.countAllTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[10px] gaia-muted">
            This is a simple estimate only. Future versions can treat these
            totals as real monthly expenses inside Wealth and sync them to your
            flows and levels.
          </p>
        </div>
      )}
    </section>
  );
};

export default FoodSpendingCard;
