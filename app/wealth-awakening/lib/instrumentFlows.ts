import type { DayKey, WealthFlow, WealthInstrument, WealthState } from "./types";
import { estimateMonthlyInterest } from "./projections";
import { getTodayInKuwait } from "./summary";

const AUTO_FLOW_KINDS: WealthFlow["kind"][] = [
  "investment",
  "interest",
  "deposit",
];

type FxSnapshot = {
  egpPerKwd: number | null;
};

function buildFxSnapshot(rate?: number): FxSnapshot {
  if (Number.isFinite(rate) && (rate ?? 0) > 0) {
    return { egpPerKwd: rate as number };
  }
  return { egpPerKwd: null };
}

function normalizeCurrency(code: string, fallback: string): string {
  const trimmed = code.trim().toUpperCase();
  return trimmed || fallback;
}

function clampDay(year: number, monthIndex: number, day: number): number {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return Math.min(day, lastDay);
}

function toIsoDate(date: Date): DayKey {
  return date.toISOString().slice(0, 10);
}

function buildMonthlySchedule(
  startDate: DayKey,
  termMonths: number,
  startOffsetMonths = 0,
): DayKey[] {
  if (!startDate || termMonths <= 0) return [];
  const [y, m, d] = startDate.split("-").map((v) => parseInt(v, 10));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return [];
  }
  const dates: DayKey[] = [];
  for (let i = 0; i < termMonths; i += 1) {
    const totalMonths = (m - 1) + startOffsetMonths + i;
    const year = y + Math.floor(totalMonths / 12);
    const monthIndex = totalMonths % 12;
    const day = clampDay(year, monthIndex, d);
    dates.push(toIsoDate(new Date(Date.UTC(year, monthIndex, day))));
  }
  return dates;
}

function computeMaturityDate(
  startDate: DayKey,
  termMonths: number,
): DayKey | null {
  if (!startDate) return null;
  const d = new Date(`${startDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCMonth(d.getUTCMonth() + (termMonths || 0));
  d.setUTCDate(d.getUTCDate() - 1);
  return toIsoDate(d);
}

function buildFlowId(
  instrumentId: string,
  kind: WealthFlow["kind"],
  date: DayKey,
): string {
  return `flow-${kind}-${instrumentId}-${date}`;
}

function convertToKwd(
  amount: number,
  currency: string,
  fx: FxSnapshot,
): { amount: number; currency: string } {
  const normalized = normalizeCurrency(currency, "KWD");
  if (normalized === "EGP" && fx.egpPerKwd) {
    const converted = amount / fx.egpPerKwd;
    return { amount: Math.round(converted * 100) / 100, currency: "KWD" };
  }
  return { amount: Math.round(amount * 100) / 100, currency: normalized };
}

function shouldIncludeAmount(value: number): boolean {
  return Number.isFinite(value) && value >= 0.01;
}

function buildInvestmentDescription(inst: WealthInstrument): string | undefined {
  const name = inst.name?.trim();
  if (name) return `Investment: ${name}`;
  return "Investment created";
}

function buildInterestDescription(inst: WealthInstrument): string | undefined {
  const name = inst.name?.trim();
  if (name) return `Investment revenue: ${name}`;
  return "Investment revenue";
}

function buildMaturityDescription(inst: WealthInstrument): string | undefined {
  const name = inst.name?.trim();
  if (name) return `Investment matured: ${name}`;
  return "Investment matured";
}

export function buildInstrumentAutoFlows(
  instrument: WealthInstrument,
  fxRate?: number,
  today?: DayKey,
): WealthFlow[] {
  const fx = buildFxSnapshot(fxRate);
  const principal = Number(instrument.principal) || 0;
  const startDate = instrument.startDate || today || getTodayInKuwait();
  const currency = normalizeCurrency(instrument.currency, "KWD");
  const termMonths = Math.max(0, Number(instrument.termMonths) || 0);
  const flows: WealthFlow[] = [];

  if (principal > 0) {
    const converted = convertToKwd(principal, currency, fx);
    if (!shouldIncludeAmount(converted.amount)) {
      return flows;
    }
    flows.push({
      id: buildFlowId(instrument.id, "investment", startDate),
      date: startDate,
      accountId: instrument.accountId || null,
      instrumentId: instrument.id,
      kind: "investment",
      amount: converted.amount,
      currency: converted.currency,
      description: buildInvestmentDescription(instrument),
    });
  }

  const monthlyInterest = estimateMonthlyInterest(instrument);
  if (monthlyInterest > 0 && termMonths > 0) {
    const schedule = buildMonthlySchedule(startDate, termMonths, 1);
    for (const date of schedule) {
      const converted = convertToKwd(monthlyInterest, currency, fx);
      if (!shouldIncludeAmount(converted.amount)) {
        continue;
      }
      flows.push({
        id: buildFlowId(instrument.id, "interest", date),
        date,
        accountId: instrument.accountId || null,
        instrumentId: instrument.id,
        kind: "interest",
        amount: converted.amount,
        currency: converted.currency,
        description: buildInterestDescription(instrument),
      });
    }
  }

  const maturityDate = computeMaturityDate(startDate, termMonths);
  if (principal > 0 && maturityDate) {
    const converted = convertToKwd(principal, currency, fx);
    if (!shouldIncludeAmount(converted.amount)) {
      return flows;
    }
    flows.push({
      id: buildFlowId(instrument.id, "deposit", maturityDate),
      date: maturityDate,
      accountId: instrument.accountId || null,
      instrumentId: instrument.id,
      kind: "deposit",
      amount: converted.amount,
      currency: converted.currency,
      description: buildMaturityDescription(instrument),
    });
  }

  return flows;
}

function isAutoFlow(flow: WealthFlow): boolean {
  return !!flow.instrumentId && AUTO_FLOW_KINDS.includes(flow.kind);
}

function flowsEqual(a: WealthFlow[], b: WealthFlow[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];
    if (!right) return false;
    if (left.id !== right.id) return false;
    if (left.date !== right.date) return false;
    if (left.kind !== right.kind) return false;
    if (left.amount !== right.amount) return false;
    if (left.currency !== right.currency) return false;
    if ((left.accountId ?? null) !== (right.accountId ?? null)) return false;
    if ((left.instrumentId ?? null) !== (right.instrumentId ?? null)) return false;
    if ((left.description ?? "") !== (right.description ?? "")) return false;
  }
  return true;
}

function sortByDateKind(a: WealthFlow, b: WealthFlow): number {
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
  return a.id.localeCompare(b.id);
}

export function mergeInstrumentFlows(
  flows: WealthFlow[],
  instrumentId: string,
  autoFlows: WealthFlow[],
): WealthFlow[] {
  const retained = flows.filter(
    (flow) => !(flow.instrumentId === instrumentId && AUTO_FLOW_KINDS.includes(flow.kind)),
  );
  const sortedAuto = autoFlows.slice().sort(sortByDateKind);
  return [...retained, ...sortedAuto];
}

export function syncInstrumentFlows(
  state: WealthState,
  fxRate?: number,
): { nextState: WealthState; changed: boolean } {
  const retained = state.flows.filter((flow) => !isAutoFlow(flow));
  const autoFlows = state.instruments.flatMap((inst) =>
    buildInstrumentAutoFlows(inst, fxRate),
  );
  const merged = [...retained, ...autoFlows.sort(sortByDateKind)];
  if (flowsEqual(state.flows, merged)) {
    return { nextState: state, changed: false };
  }
  return { nextState: { ...state, flows: merged }, changed: true };
}
