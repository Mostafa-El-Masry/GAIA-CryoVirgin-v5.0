"use client";

import { useEffect, useMemo, useState } from "react";
import { useWealthUnlocks } from "../hooks/useWealthUnlocks";
import type { WealthFlow, WealthState } from "../lib/types";
import {
  loadWealthStateWithRemote,
  saveWealthStateWithRemote,
} from "../lib/wealthStore";
import { buildWealthOverview, getTodayInKuwait } from "../lib/summary";
import { estimateMonthlyInterest } from "../lib/projections";
import { getExchangeRate } from "../lib/exchangeRate";
import { syncInstrumentFlows } from "../lib/instrumentFlows";

type FormState = {
  date: string;
  kind: WealthFlow["kind"];
  amount: string;
  currency: string;
  repeatMonthly: boolean;
  description: string;
};

type FxInfo = {
  rate: number;
  timestamp: number;
  isCached: boolean;
};

const kindOptions: { value: WealthFlow["kind"]; label: string }[] = [
  { value: "income", label: "Income (salary / side)" },
  { value: "deposit", label: "Deposit into savings / CD" },
  { value: "investment", label: "Investment (certificate)" },
  { value: "interest", label: "Interest received" },
  { value: "expense", label: "Expenses (grouped)" },
  { value: "withdrawal", label: "Withdraw from stash" },
];

const surface = "wealth-surface text-[var(--gaia-text-default)]";

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
    return null;
  }

  const [state, setState] = useState<WealthState | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    date: "",
    kind: "deposit",
    amount: "",
    currency: "",
    repeatMonthly: false,
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [fxInfo, setFxInfo] = useState<FxInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const s = await loadWealthStateWithRemote();
      if (cancelled) return;
      setState(s);
      const todayMonth = toMonthKey(getTodayInKuwait());
      setSelectedMonth(todayMonth);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateFx() {
      const info = await getExchangeRate();
      if (!cancelled) {
        setFxInfo(info);
      }
    }

    hydrateFx();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state || !fxInfo) return;
    const { nextState, changed } = syncInstrumentFlows(state, fxInfo.rate);
    if (!changed) return;
    setState(nextState);
    void saveWealthStateWithRemote(nextState);
  }, [state, fxInfo]);

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

  const currentMonthKey =
    selectedMonth || (months.length > 0 ? months[0] : null);

  const overviewForMonth = useMemo(() => {
    if (!state || !currentMonthKey) return null;
    const pseudoToday = buildDayForMonth(currentMonthKey);
    return buildWealthOverview(state, pseudoToday);
  }, [state, currentMonthKey]);

  const flowsThisMonth: WealthFlow[] = useMemo(() => {
    if (!state || !currentMonthKey) return [];
    return state.flows.filter((f) => toMonthKey(f.date) === currentMonthKey);
  }, [state, currentMonthKey]);

  const primaryCurrency =
    overviewForMonth?.primaryCurrency || state?.accounts[0]?.currency || "KWD";
  const fxText =
    fxInfo && fxInfo.rate > 0
      ? `1 KWD ~ ${fxInfo.rate.toFixed(2)} EGP | ${fxInfo.isCached ? "cached last 24h" : "fresh"}`
      : "FX unavailable";

  function handleFormChange<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleEditFlow(flow: WealthFlow) {
    setEditingId(flow.id);
    setIsAdding(false);
    setForm({
      date: flow.date,
      kind: flow.kind,
      amount: String(flow.amount),
      currency: flow.currency,
      repeatMonthly: false,
      description: flow.description ?? "",
    });
    setSelectedMonth(toMonthKey(flow.date));
  }

  function handleDeleteFlow(flowId: string) {
    if (!state) return;
    const nextState: WealthState = {
      ...state,
      flows: state.flows.filter((f) => f.id !== flowId),
    };
    setState(nextState);
    void saveWealthStateWithRemote(nextState);
    if (editingId === flowId) {
      handleCancelEdit();
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setIsAdding(false);
    setForm({
      date: "",
      kind: "deposit",
      amount: "",
      currency: "",
      repeatMonthly: false,
      description: "",
    });
  }

  function handleStartAdd() {
    setEditingId(null);
    setIsAdding(true);
    setForm({
      date: "",
      kind: "deposit",
      amount: "",
      currency: primaryCurrency,
      repeatMonthly: false,
      description: "",
    });
  }

  async function handleSaveFlow() {
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
      const baseFlow: WealthFlow = {
        id: generateId("flow"),
        date,
        accountId: null,
        instrumentId: null,
        kind: form.kind,
        amount,
        currency: form.currency || primaryCurrency,
        description: form.description || undefined,
      };

      const flowsToAdd: WealthFlow[] = [];

      if (form.repeatMonthly && form.kind === "expense") {
        const start = new Date(`${date}T00:00:00`);
        for (let i = 0; i < 6; i++) {
          const d = new Date(start);
          d.setUTCMonth(start.getUTCMonth() + i);
          const iso = d.toISOString().slice(0, 10);
          flowsToAdd.push({ ...baseFlow, id: generateId("flow"), date: iso });
        }
      } else {
        flowsToAdd.push(baseFlow);
      }

      updated = {
        ...state,
        flows: [...state.flows, ...flowsToAdd],
      };
    }

    setState(updated);
    setSaving(true);
    await saveWealthStateWithRemote(updated);
    setSaving(false);

    const newMonthKey = toMonthKey(date);
    setSelectedMonth(newMonthKey);
    setEditingId(null);
    setIsAdding(false);
    setForm({
      date: "",
      kind: "deposit",
      amount: "",
      currency: "",
      repeatMonthly: false,
      description: "",
    });
  }

  if (!state || !currentMonthKey || !overviewForMonth) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-slate-100">
        <section className={`${surface} p-6 text-sm text-slate-300`}>
          Loading your Wealth flows and monthly story...
        </section>
      </main>
    );
  }

  const story = overviewForMonth.monthStory;
  const instrumentInterestByCurrency = new Map<string, number>();
  const instrumentPrincipalByCurrency = new Map<string, number>();
  if (overviewForMonth.instruments) {
    for (const inst of overviewForMonth.instruments) {
      const monthly = estimateMonthlyInterest(inst);
      const prev = instrumentInterestByCurrency.get(inst.currency) ?? 0;
      instrumentInterestByCurrency.set(inst.currency, prev + monthly);
      const prevPrincipal =
        instrumentPrincipalByCurrency.get(inst.currency) ?? 0;
      instrumentPrincipalByCurrency.set(
        inst.currency,
        prevPrincipal + inst.principal,
      );
    }
  }
  const investmentByCurrency = new Map<string, number>();
  for (const flow of flowsThisMonth) {
    if (flow.kind !== "investment") continue;
    const prev = investmentByCurrency.get(flow.currency) ?? 0;
    investmentByCurrency.set(flow.currency, prev + flow.amount);
  }
  let frozenPrincipal = 0;
  let frozenCurrency = primaryCurrency;
  if (investmentByCurrency.has(primaryCurrency)) {
    frozenPrincipal = investmentByCurrency.get(primaryCurrency) ?? 0;
    frozenCurrency = primaryCurrency;
  } else {
    const first = Array.from(investmentByCurrency.entries())[0];
    if (first) {
      frozenPrincipal = first[1];
      frozenCurrency = first[0];
    }
  }
  const plannedSalaryIncome =
    state?.accounts
      .filter((a) => /salary|income/i.test(`${a.name} ${a.note ?? ""}`))
      .reduce((sum, a) => sum + a.currentBalance, 0) ?? 0;
  const baseIncome =
    story.totalIncome > 0 ? story.totalIncome : plannedSalaryIncome;
  const displayIncome = baseIncome;
  let displayInterest = story.totalInterest;
  let displayInterestCurrency = primaryCurrency;
  if (!(displayInterest > 0)) {
    if (instrumentInterestByCurrency.has(primaryCurrency)) {
      displayInterest = instrumentInterestByCurrency.get(primaryCurrency) ?? 0;
      displayInterestCurrency = primaryCurrency;
    } else {
      const first = Array.from(instrumentInterestByCurrency.entries())[0];
      if (first) {
        displayInterest = first[1];
        displayInterestCurrency = first[0];
      } else {
        displayInterest = 0;
        displayInterestCurrency = primaryCurrency;
      }
    }
  }

  let displayDeposits = story.totalDeposits;
  let displayDepositsCurrency = primaryCurrency;
  if (!(displayDeposits > 0)) {
    if (
      investmentByCurrency.size === 0 &&
      instrumentPrincipalByCurrency.has(primaryCurrency)
    ) {
      displayDeposits = instrumentPrincipalByCurrency.get(primaryCurrency) ?? 0;
      displayDepositsCurrency = primaryCurrency;
    } else {
      const first = Array.from(instrumentPrincipalByCurrency.entries())[0];
      if (investmentByCurrency.size === 0 && first) {
        displayDeposits = first[1];
        displayDepositsCurrency = first[0];
      }
    }
  }
  const inflowsTotal =
    story.totalIncome + story.totalDeposits + story.totalInterest;
  const outflowsTotal =
    story.totalExpenses +
    story.totalWithdrawals +
    (frozenCurrency === primaryCurrency ? frozenPrincipal : 0);
  const monthlySurplus = inflowsTotal - outflowsTotal;

  return (
    <main className="mx-auto w-full space-y-6 px-4 py-8 text-[var(--gaia-text-default)]">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
            Wall Street Drive
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[var(--gaia-text-strong)]">
            Monthly story & flows
          </h1>
          <p className="mt-2 max-w-3xl text-sm gaia-muted">
            For any month, see how your stash moved: deposits, income, interest,
            expenses, and withdrawals - with a calm story on top.
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
            Surplus this month:{" "}
            <span className="font-semibold text-emerald-200">
              {formatCurrency(monthlySurplus, primaryCurrency)}
            </span>
          </p>
          <p className="mt-3 text-[11px] text-slate-500">{fxText}</p>
        </article>

        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Inflows
          </h2>
          <dl className="mt-2 space-y-1 text-xs text-slate-200">
            <div className="flex items-center justify-between gap-2">
              <dt>Income</dt>
              <dd className="font-semibold text-white">
                {formatCurrency(displayIncome, primaryCurrency)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Deposits</dt>
              <dd className="font-semibold text-white">
                {formatCurrency(displayDeposits, displayDepositsCurrency)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Interest</dt>
              <dd className="font-semibold text-white">
                {formatCurrency(displayInterest, displayInterestCurrency)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] text-slate-400">
            Income falls back to salary accounts when no income flow is logged.
            Interest includes estimated certificate yield when no interest flow
            is logged; shown in its currency. Deposits fall back to certificate
            principal when no deposit flow is logged and no certificate
            investment was created.
          </p>
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
            {frozenPrincipal > 0 && (
              <div className="flex items-center justify-between gap-2">
                <dt>Principal frozen</dt>
                <dd className="font-semibold text-white">
                  {formatCurrency(frozenPrincipal, frozenCurrency)}
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-3 text-[11px] text-slate-400">
            Later, this view will also drive a daily{" "}
            <span className="font-semibold">Money Pulse</span> line in the Daily
            Thread (deposit day, interest day, or quiet day).
          </p>
        </article>
      </section>

      <section className="space-y-4">
        <article className={`${surface} p-4`}>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Flows this month
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                A simple journal of what actually happened to your money.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartAdd}
              className="inline-flex items-center rounded-full border border-[var(--gaia-contrast-bg)]/40 bg-[var(--gaia-contrast-bg)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)]"
              disabled={isAdding || !!editingId}
            >
              + Add flow
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-200">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Date</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Currency</th>
                  <th className="px-3 py-2">Notes</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <tr className="border-b border-slate-800">
                    <td className="py-2 pr-3 align-top">
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) =>
                          handleFormChange("date", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <select
                        value={form.kind}
                        onChange={(e) =>
                          handleFormChange(
                            "kind",
                            e.target.value as WealthFlow["kind"],
                          )
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                      >
                        {kindOptions.map((k) => (
                          <option key={k.value} value={k.value}>
                            {k.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={form.amount}
                        onChange={(e) =>
                          handleFormChange("amount", e.target.value)
                        }
                        className="w-28 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-right text-[11px] text-white"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="text"
                        value={form.currency}
                        onChange={(e) =>
                          handleFormChange(
                            "currency",
                            e.target.value.toUpperCase(),
                          )
                        }
                        className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                        placeholder={primaryCurrency}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="text"
                        value={form.description}
                        onChange={(e) =>
                          handleFormChange("description", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                        placeholder="Short note"
                      />
                      <label className="mt-2 flex items-center gap-2 text-[11px] text-slate-300">
                        <input
                          type="checkbox"
                          checked={form.repeatMonthly}
                          onChange={(e) =>
                            handleFormChange("repeatMonthly", e.target.checked)
                          }
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-400 focus:ring-emerald-500"
                        />
                        Repeat expense monthly (next 6 months)
                      </label>
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={handleSaveFlow}
                          className="rounded-full border border-[var(--gaia-contrast-bg)]/60 bg-[var(--gaia-contrast-bg)]/12 px-3 py-1 text-[11px] font-semibold text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)] disabled:opacity-50"
                          disabled={!form.amount || saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-200 hover:border-rose-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {flowsThisMonth.map((flow) => {
                  const isEditing = editingId === flow.id;
                  return (
                    <tr
                      key={flow.id}
                      className="border-b border-slate-800 last:border-b-0"
                    >
                      <td className="py-2 pr-3 align-top text-[11px] text-slate-400">
                        {isEditing ? (
                          <input
                            type="date"
                            value={form.date}
                            onChange={(e) =>
                              handleFormChange("date", e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                          />
                        ) : (
                          flow.date
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-[11px] text-slate-300">
                        {isEditing ? (
                          <select
                            value={form.kind}
                            onChange={(e) =>
                              handleFormChange(
                                "kind",
                                e.target.value as WealthFlow["kind"],
                              )
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                          >
                            {kindOptions.map((k) => (
                              <option key={k.value} value={k.value}>
                                {k.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          kindOptions.find((k) => k.value === flow.kind)?.label
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-white">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={form.amount}
                            onChange={(e) =>
                              handleFormChange("amount", e.target.value)
                            }
                            className="w-28 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-right text-[11px] text-white"
                          />
                        ) : (
                          formatCurrency(flow.amount, flow.currency)
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-[11px] text-slate-300">
                        {isEditing ? (
                          <input
                            type="text"
                            value={form.currency}
                            onChange={(e) =>
                              handleFormChange(
                                "currency",
                                e.target.value.toUpperCase(),
                              )
                            }
                            className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                          />
                        ) : (
                          flow.currency
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-[11px] text-slate-500">
                        {isEditing ? (
                          <input
                            type="text"
                            value={form.description}
                            onChange={(e) =>
                              handleFormChange("description", e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                          />
                        ) : (
                          flow.description || (
                            <span className="opacity-60">-</span>
                          )
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-right">
                        {isEditing ? (
                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={handleSaveFlow}
                              className="rounded-full border border-[var(--gaia-contrast-bg)]/60 bg-[var(--gaia-contrast-bg)]/12 px-3 py-1 text-[11px] font-semibold text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)] disabled:opacity-50"
                              disabled={!form.amount || saving}
                            >
                              {saving ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-200 hover:border-rose-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditFlow(flow)}
                              className="mr-2 rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-200 hover:border-emerald-400 hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFlow(flow.id)}
                              className="rounded-full border border-rose-500/70 bg-slate-900 px-2 py-1 text-[11px] font-medium text-rose-300 hover:border-rose-400 hover:text-white"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {flowsThisMonth.length === 0 && !isAdding && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 text-center text-xs text-slate-400"
                    >
                      No flows recorded for this month yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Data is stored in Supabase when configured, with local cache
            disabled for flows.
          </p>
        </article>
      </section>
    </main>
  );
}
