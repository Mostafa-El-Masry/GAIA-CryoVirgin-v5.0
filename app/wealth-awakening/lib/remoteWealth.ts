import { getSupabaseClient, hasSupabaseClient } from "./supabaseClient";
import type {
  WealthAccount,
  WealthInstrument,
  WealthFlow,
  WealthState,
} from "./types";

export function hasSupabaseConfig(): boolean {
  return hasSupabaseClient();
}

function mapAccountFromRow(row: any): WealthAccount {
  return {
    id: String(row.id),
    name: row.name ?? "",
    currency: row.currency ?? "KWD",
    type: row.type ?? "cash",
    currentBalance: Number(row.current_balance ?? 0),
    isPrimary: !!row.is_primary,
    note: row.note ?? undefined,
  };
}

function mapInstrumentFromRow(row: any): WealthInstrument {
  return {
    id: String(row.id),
    reference: row.reference ?? null,
    accountNumber: row.account_number ?? null,
    bankName: row.bank_name ?? null,
    revenueFrequency: row.revenue_frequency ?? null,
    accountId: row.account_id ?? "",
    name: row.name ?? "",
    currency: row.currency ?? "KWD",
    principal: Number(row.principal ?? 0),
    startDate: row.start_date ?? "2026-01-01",
    termMonths: Number(row.term_months ?? 0),
    annualRatePercent: Number(row.annual_rate_percent ?? 0),
    payoutFrequency: row.payout_frequency ?? "monthly-interest",
    autoRenew: !!row.auto_renew,
    note: row.note ?? undefined,
  };
}

function mapFlowFromRow(row: any): WealthFlow {
  return {
    id: String(row.id),
    date: row.date ?? "2026-01-01",
    accountId: row.account_id ?? null,
    instrumentId: row.instrument_id ?? null,
    kind: row.kind ?? "deposit",
    amount: Number(row.amount ?? 0),
    currency: row.currency ?? "KWD",
    description: row.description ?? undefined,
  };
}

function mapAccountToRow(acc: WealthAccount) {
  return {
    id: acc.id,
    name: acc.name,
    currency: acc.currency,
    type: acc.type,
    current_balance: acc.currentBalance,
    is_primary: acc.isPrimary ?? false,
    note: acc.note ?? null,
  };
}

function mapInstrumentToRow(inst: WealthInstrument) {
  return {
    id: inst.id,
    reference: inst.reference ?? null,
    account_number: inst.accountNumber ?? null,
    bank_name: inst.bankName ?? null,
    revenue_frequency: inst.revenueFrequency ?? null,
    account_id: inst.accountId ? inst.accountId : null,
    name: inst.name,
    currency: inst.currency,
    principal: inst.principal,
    start_date: inst.startDate,
    term_months: inst.termMonths,
    annual_rate_percent: inst.annualRatePercent,
    payout_frequency: inst.payoutFrequency,
    auto_renew: inst.autoRenew,
    note: inst.note ?? null,
  };
}

function mapFlowToRow(flow: WealthFlow) {
  return {
    id: flow.id,
    date: flow.date,
    account_id: flow.accountId ? flow.accountId : null,
    instrument_id: flow.instrumentId ? flow.instrumentId : null,
    kind: flow.kind,
    amount: flow.amount,
    currency: flow.currency,
    description: flow.description ?? null,
  };
}

export async function fetchRemoteWealthAll(): Promise<WealthState | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const [accRes, instRes, flowRes] = await Promise.all([
      supabase.from("wealth_accounts").select("*"),
      supabase.from("wealth_instruments").select("*"),
      supabase.from("wealth_flows").select("*"),
    ]);

    if (accRes.error || instRes.error || flowRes.error) {
      console.warn("[Wealth] Supabase fetch error", {
        accError: accRes.error,
        instError: instRes.error,
        flowError: flowRes.error,
      });
      return null;
    }

    const accounts: WealthAccount[] = (accRes.data ?? []).map(
      mapAccountFromRow
    );
    const instruments: WealthInstrument[] = (instRes.data ?? []).map(
      mapInstrumentFromRow
    );
    const flows: WealthFlow[] = (flowRes.data ?? []).map(mapFlowFromRow);

    return { accounts, instruments, flows };
  } catch (err) {
    console.warn("[Wealth] Supabase fetch exception", err);
    return null;
  }
}

export async function pushRemoteWealthAll(
  state: WealthState
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const accountsRows = state.accounts.map(mapAccountToRow);
    const instrumentsRows = state.instruments.map(mapInstrumentToRow);
    const flowsRows = state.flows.map(mapFlowToRow);

    const accRes = accountsRows.length
      ? await supabase
          .from("wealth_accounts")
          .upsert(accountsRows, { onConflict: "id" })
      : { error: null };
    if (accRes.error) {
      console.warn("[Wealth] Supabase upsert error", {
        accError: accRes.error,
      });
      return false;
    }

    const instRes = instrumentsRows.length
      ? await supabase
          .from("wealth_instruments")
          .upsert(instrumentsRows, { onConflict: "id" })
      : { error: null };
    if (instRes.error) {
      console.warn("[Wealth] Supabase upsert error", {
        instError: instRes.error,
      });
      return false;
    }

    const flowRes = flowsRows.length
      ? await supabase
          .from("wealth_flows")
          .upsert(flowsRows, { onConflict: "id" })
      : { error: null };
    if (flowRes.error) {
      console.warn("[Wealth] Supabase upsert error", {
        flowError: flowRes.error,
      });
      return false;
    }

    return true;
  } catch (err) {
    console.warn("[Wealth] Supabase upsert exception", err);
    return false;
  }
}

export async function fetchRemoteFlowIds(): Promise<string[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const res = await supabase.from("wealth_flows").select("id");
    if (res.error) {
      console.warn("[Wealth] Supabase flow id fetch error", res.error);
      return null;
    }
    return (res.data ?? []).map((row) => String(row.id));
  } catch (err) {
    console.warn("[Wealth] Supabase flow id fetch exception", err);
    return null;
  }
}

export async function deleteRemoteFlows(flowIds: string[]): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  if (!flowIds.length) return true;

  try {
    const res = await supabase.from("wealth_flows").delete().in("id", flowIds);
    if (res.error) {
      console.warn("[Wealth] Supabase flow delete error", res.error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Wealth] Supabase flow delete exception", err);
    return false;
  }
}

export async function fetchRemoteInstrumentIds(): Promise<string[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const res = await supabase.from("wealth_instruments").select("id");
    if (res.error) {
      console.warn("[Wealth] Supabase instrument id fetch error", res.error);
      return null;
    }
    return (res.data ?? []).map((row) => String(row.id));
  } catch (err) {
    console.warn("[Wealth] Supabase instrument id fetch exception", err);
    return null;
  }
}

export async function deleteRemoteInstruments(
  instrumentIds: string[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  if (!instrumentIds.length) return true;

  try {
    const res = await supabase
      .from("wealth_instruments")
      .delete()
      .in("id", instrumentIds);
    if (res.error) {
      console.warn("[Wealth] Supabase instrument delete error", res.error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Wealth] Supabase instrument delete exception", err);
    return false;
  }
}
