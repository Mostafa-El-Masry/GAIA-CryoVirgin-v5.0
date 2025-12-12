import type { WealthState } from "./types";
import { hasSupabaseConfig, fetchRemoteWealthAll, pushRemoteWealthAll } from "./remoteWealth";

const LOCAL_KEY = "gaia_wealth_awakening_state_v2";

const DEFAULT_STATE: WealthState = {
  accounts: [],
  instruments: [],
  flows: [],
};

const SAMPLE_ACCOUNT_IDS = ["cash-main", "cd-egp-long-term", "invest-future"];
const SAMPLE_FLOW_IDS = ["flow-salary-1", "flow-expense-1"];

function mergeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>();
  secondary.forEach((item) => map.set(item.id, item));
  primary.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function loadLocal(): WealthState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(DEFAULT_STATE));
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(raw);
    return {
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      instruments: Array.isArray(parsed.instruments) ? parsed.instruments : [],
      flows: Array.isArray(parsed.flows) ? parsed.flows : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveLocal(state: WealthState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function loadWealthState(): WealthState {
  return loadLocal();
}

export function saveWealthState(state: WealthState): void {
  saveLocal(state);
}

export function resetWealthState(): WealthState {
  saveLocal(DEFAULT_STATE);
  return DEFAULT_STATE;
}

export async function loadWealthStateWithRemote(): Promise<WealthState> {
  if (!hasSupabaseConfig()) {
    return loadLocal();
  }

  const local = loadLocal();
  const remote = await fetchRemoteWealthAll();
  if (!remote) return local;

  const cleaned: WealthState = {
    accounts: remote.accounts.filter((a) => !SAMPLE_ACCOUNT_IDS.includes(a.id)),
    instruments: remote.instruments,
    flows: remote.flows.filter((f) => !SAMPLE_FLOW_IDS.includes(f.id)),
  };

  const remoteIsEmpty =
    cleaned.accounts.length === 0 &&
    cleaned.instruments.length === 0 &&
    cleaned.flows.length === 0;

  // If Supabase is empty but local has data, keep local and push up.
  if (remoteIsEmpty && (local.accounts.length || local.instruments.length || local.flows.length)) {
    await pushRemoteWealthAll(local);
    saveLocal(local);
    return local;
  }

  const wasCleaned =
    cleaned.accounts.length !== remote.accounts.length ||
    cleaned.flows.length !== remote.flows.length;

  if (wasCleaned) {
    await pushRemoteWealthAll(cleaned);
  }

  // Merge remote with any local additions to avoid accidental wipes.
  const merged: WealthState = {
    accounts: mergeById(cleaned.accounts, local.accounts),
    instruments: mergeById(cleaned.instruments, local.instruments),
    flows: mergeById(cleaned.flows, local.flows),
  };

  saveLocal(merged);
  return merged;
}

export async function saveWealthStateWithRemote(state: WealthState): Promise<void> {
  if (hasSupabaseConfig()) {
    const ok = await pushRemoteWealthAll(state);
    if (!ok) {
      // fall back to local so user data isn't lost if Supabase fails
      saveLocal(state);
    }
  } else {
    saveLocal(state);
  }
}

export async function resetWealthStateWithRemote(): Promise<WealthState> {
  if (hasSupabaseConfig()) {
    await pushRemoteWealthAll(DEFAULT_STATE);
  }
  saveLocal(DEFAULT_STATE);
  return DEFAULT_STATE;
}
