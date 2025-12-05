"use client";

import { useEffect, useMemo, useState } from "react";
import { useWealthUnlocks } from "../hooks/useWealthUnlocks";
import type { WealthFlow, WealthState } from "../lib/types";
import { loadWealthState } from "../lib/wealthStore";
import { buildWealthOverview, getTodayInKuwait } from "../lib/summary";
import { saveWealthStateWithRemote } from "../lib/wealthStore";

type FormState = {
  date: string;
  kind: WealthFlow["kind"];
  amount: string;
  currency: string;
  description: string;
};

const kindOptions: { value: WealthFlow["kind"]; label: string }[] = [
  { value: "income", label: "Income (salary / side)" },
  { value: "deposit", label: "Deposit into savings / CD" },
  { value: "interest", label: "Interest received" },
  { value: "expense", label: "Expenses (grouped)" },
  { value: "withdrawal", label: "Withdraw from stash" },
];

const surface =
  "rounded-2xl border gaia-border bg-[var(--gaia-surface)] text-[var(--gaia-text-default)] shadow-[0_18px_60px_rgba(0,0,0,0.18)]";

function toMonthKey(day: string): string {
  return day.slice(0, 7);
}

function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(1)}%`;
}

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map((v) => parseInt(v, 10));
  if (!year || !month) return monthKey;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function buildDayForMonth(monthKey: string): string {
  return `${monthKey}-15`;
}

function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

export default function WealthFlowsPage() {
  const { canAccess, stage, totalLessonsCompleted } = useWealthUnlocks();
  if (!canAccess("flows")) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-[var(--gaia-text-default)]">
        <section className={`${surface} p-8`}>
          <h1 className="text-xl font-semibold text-white">Monthly flows locked</h1>
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
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    date: "",
    kind: "deposit",
    amount: "",
    currency: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadWealthState();
    setState(s);
    const todayMonth = toMonthKey(getTodayInKuwait());
    setSelectedMonth(todayMonth);
  }, []);

  const months = useMemo(() => {
    if (!state) return [] as string[];
    const set = new Set<string>();
    for (const f of state.flows) {
      if (f.date) {
        set.add(toMonthKey(f.date));
      }
    }
    if (selectedMonth) {
      set.add(selectedMonth);
    }
    return Array.from(set).sort().reverse();
  }, [state, selectedMonth]);

  const currentMonthKey = selectedMonth || (months.length > 0 ? months[0] : null);

  const overviewForMonth = useMemo(() => {
    if (!state || !currentMonthKey) return null;
    const pseudoToday = buildDayForMonth(currentMonthKey);
    return buildWealthOverview(state, pseudoToday);
  }, [state, currentMonthKey]);

  const flowsThisMonth: WealthFlow[] = useMemo(() => {
    if (!state || !currentMonthKey) return [];
    return state.flows.filter((f) => toMonthKey(f.date) === currentMonthKey);
  }, [state, currentMonthKey]);

  const primaryCurrency = overviewForMonth?.primaryCurrency || state?.accounts[0]?.currency || "KWD";

  function handleFormChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleEditFlow(flow: WealthFlow) {
    setEditingId(flow.id);
    setForm({
      date: flow.date,
      kind: flow.kind,
      amount: String(flow.amount),
      currency: flow.currency,
      description: flow.description ?? "",
    });
    setSelectedMonth(toMonthKey(flow.date));
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({
      date: "",
      kind: "deposit",
      amount: "",
      currency: "",
      description: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state) return;

    const amount = parseFloat(form.amount || "0");
    if (!Number.isFinite(amount) || amount === 0) {
      return;
    }

    const date = form.date || getTodayInKuwait();

    let updated: WealthState;

    if (editingId) {
      const updatedFlows = state.flows.map((f) =>
        f.id === editingId
          ? {
              ...f,
              date,
              kind: form.kind,
              amount,
              currency: form.currency || primaryCurrency,
              description: form.description || undefined,
            }
          : f,
      );
      updated = { ...state, flows: updatedFlows };
    } else {
      const newFlow: WealthFlow = {
        id: generateId("flow"),
        date,
        accountId: null,
        instrumentId: null,
        kind: form.kind,
        amount,
        currency: form.currency || primaryCurrency,
        description: form.description || undefined,
      };
      updated = {
        ...state,
        flows: [...state.flows, newFlow],
      };
    }

    setState(updated);
    setSaving(true);
    await saveWealthStateWithRemote(updated);
    setSaving(false);

    const newMonthKey = toMonthKey(date);
    setSelectedMonth(newMonthKey);
    setEditingId(null);
    setForm({
      date: "",
      kind: "deposit",
      amount: "",
      currency: "",
      description: "",
    });
  }

  if (!state || !currentMonthKey || !overviewForMonth) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-slate-100">
        <section className={`${surface} p-6 text-sm text-slate-300`}>
          Loading your Wealth flows and monthly story from local cache...
        </section>
      </main>
    );
  }

  const story = overviewForMonth.monthStory;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-[var(--gaia-text-default)]">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
            Wall Street Drive
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[var(--gaia-text-strong)]">
            Monthly story & flows
          </h1>
          <p className="mt-2 max-w-3xl text-sm gaia-muted">
            For any month, see how your stash moved: deposits, income, interest, expenses, and
            withdrawals - with a calm story on top.
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 md:mt-0">
          <label className="text-xs text-slate-300">
            Month
            <select
              className="ml-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-white shadow-inner shadow-black/30"
              value={currentMonthKey}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Money story
          </h2>
          <p className="mt-2 text-sm text-slate-200">{story.story}</p>
          <p className="mt-3 text-xs text-slate-300">
            Net change this month:{" "}
            <span className="font-semibold text-emerald-200">
              {formatCurrency(story.netChange, primaryCurrency)}
            </span>{" "}
            ({formatPercent(story.netChangePercent)})
          </p>
        </article>

        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Inflows
          </h2>
          <dl className="mt-2 space-y-1 text-xs text-slate-200">
            <div className="flex items-center justify-between gap-2">
              <dt>Income</dt>
              <dd className="font-semibold text-white">
                {formatCurrency(story.totalIncome, primaryCurrency)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Deposits</dt>
              <dd className="font-semibold text-white">
                {formatCurrency(story.totalDeposits, primaryCurrency)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Interest</dt>
              <dd className="font-semibold text-white">
                {formatCurrency(story.totalInterest, primaryCurrency)}
              </dd>
            </div>
          </dl>
        </article>

        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Outflows
          </h2>
          <dl className="mt-2 space-y-1 text-xs text-slate-200">
            <div className="flex items-center justify-between gap-2">
              <dt>Expenses</dt>
              <dd className="font-semibold text-white">
                {formatCurrency(story.totalExpenses, primaryCurrency)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Withdrawals</dt>
              <dd className="font-semibold text-white">
                {formatCurrency(story.totalWithdrawals, primaryCurrency)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] text-slate-400">
            Later, this view will also drive a daily <span className="font-semibold">Money Pulse</span>{" "}
            line in the Daily Thread (deposit day, interest day, or quiet day).
          </p>
        </article>
      </section>

      <section className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)]">
        <article className={`${surface} p-4`}>
          <h2 className="text-sm font-semibold text-white">Flows this month</h2>
          <p className="mt-1 text-xs text-slate-400">
            A simple journal of what actually happened to your money.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-200">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Date</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Currency</th>
                  <th className="px-3 py-2">Notes</th>
                  <th className="px-3 py-2 text-right">Edit</th>
                </tr>
              </thead>
              <tbody>
                {flowsThisMonth.map((flow) => (
                  <tr key={flow.id} className="border-b border-slate-800 last:border-b-0">
                    <td className="py-2 pr-3 align-top text-[11px] text-slate-400">{flow.date}</td>
                    <td className="px-3 py-2 align-top text-[11px] text-slate-300">
                      {kindOptions.find((k) => k.value === flow.kind)?.label}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-white">
                      {formatCurrency(flow.amount, flow.currency)}
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] text-slate-300">{flow.currency}</td>
                    <td className="px-3 py-2 align-top text-[11px] text-slate-500">
                      {flow.description || <span className="opacity-60">-</span>}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <button
                        type="button"
                        onClick={() => handleEditFlow(flow)}
                        className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-200 hover:border-emerald-400 hover:text-white"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {flowsThisMonth.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-xs text-slate-400">
                      No flows recorded for this month yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className={`${surface} p-4`}>
          <h2 className="text-sm font-semibold text-white">
            {editingId ? "Edit flow" : "Add a flow"}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {editingId
              ? "Update an existing income, expense, interest event, or other flow. GAIA will recompute your monthly story and levels."
              : "Manually log a deposit, income, interest event, grouped expenses, or a withdrawal. GAIA will fold it into your monthly story and, if configured, back it up to Supabase."}
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <label className="flex-1 text-xs text-slate-300">
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white shadow-inner shadow-black/30"
                />
              </label>
              <label className="flex-1 text-xs text-slate-300">
                Type
                <select
                  value={form.kind}
                  onChange={(e) => handleFormChange("kind", e.target.value as WealthFlow["kind"])}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white shadow-inner shadow-black/30"
                >
                  {kindOptions.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex gap-3">
              <label className="flex-1 text-xs text-slate-300">
                Amount
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => handleFormChange("amount", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white shadow-inner shadow-black/30"
                  placeholder="0.00"
                />
              </label>
              <label className="w-24 text-xs text-slate-300">
                Currency
                <input
                  type="text"
                  value={form.currency}
                  onChange={(e) => handleFormChange("currency", e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white shadow-inner shadow-black/30"
                  placeholder={primaryCurrency}
                />
              </label>
            </div>

            <label className="block text-xs text-slate-300">
              Notes (optional)
              <textarea
                value={form.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                className="mt-1 h-16 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white shadow-inner shadow-black/30"
                placeholder="Short note like 'Salary into main KWD buffer'"
              />
            </label>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:opacity-50"
                disabled={!form.amount || saving}
              >
                {saving ? (editingId ? "Updating..." : "Saving...") : editingId ? "Update flow" : "Save flow"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:border-rose-400 hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              Data is stored locally in your browser and, when Supabase is configured, also backed
              up to the online Wealth tables.
            </p>
          </form>
        </article>
      </section>
    </main>
  );
}
