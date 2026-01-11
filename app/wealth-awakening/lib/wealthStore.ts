import type { WealthFlow, WealthState } from "./types";
import {
  hasSupabaseConfig,
  fetchRemoteWealthAll,
  fetchRemoteFlowIds,
  fetchRemoteInstrumentIds,
  pushRemoteWealthAll,
  deleteRemoteFlows,
  deleteRemoteInstruments,
} from "./remoteWealth";

const LOCAL_KEY = "gaia_wealth_awakening_state_v2";
const LEGACY_MIGRATION_KEY = "gaia_wealth_awakening_migrated_v1";

const DEFAULT_STATE: WealthState = {
  accounts: [],
  instruments: [],
  flows: [],
};

const SAMPLE_ACCOUNT_IDS = ["cash-main", "cd-egp-long-term", "invest-future"];
const SAMPLE_FLOW_IDS = ["flow-salary-1", "flow-expense-1"];

function mergeById<T extends { id: string }>(
  primary: T[],
  secondary: T[]
): T[] {
  const map = new Map<string, T>();
  secondary.forEach((item) => map.set(item.id, item));
  primary.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function isZeroInterestFlow(flow: WealthFlow): boolean {
  return flow.kind === "interest" && (Number(flow.amount) || 0) <= 0;
}

function cleanFlows(flows: WealthFlow[]): {
  cleaned: WealthFlow[];
  removedIds: string[];
} {
  const removedIds: string[] = [];
  const cleaned = flows.filter((flow) => {
    if (isZeroInterestFlow(flow)) {
      removedIds.push(flow.id);
      return false;
    }
    return true;
  });
  return { cleaned, removedIds };
}

function cleanState(state: WealthState): {
  cleaned: WealthState;
  removedFlowIds: string[];
} {
  const { cleaned, removedIds } = cleanFlows(state.flows);
  return { cleaned: { ...state, flows: cleaned }, removedFlowIds: removedIds };
}

function loadLocal(): WealthState {
  return DEFAULT_STATE;
}

function saveLocal(state: WealthState, omitFlows = false) {
  void state;
  void omitFlows;
}

function setLegacyMigrationFlag(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEGACY_MIGRATION_KEY, "1");
  } catch {
    // ignore
  }
}

function clearLegacyLocal(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LOCAL_KEY);
  } catch {
    // ignore
  }
}

function readLegacyLocal(): WealthState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const flows = Array.isArray(parsed.flows) ? parsed.flows : [];
    const { cleaned } = cleanFlows(flows);
    return {
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      instruments: Array.isArray(parsed.instruments) ? parsed.instruments : [],
      flows: cleaned,
    };
  } catch {
    return null;
  }
}

function hasAnyData(state: WealthState | null): boolean {
  if (!state) return false;
  return Boolean(
    state.accounts.length || state.instruments.length || state.flows.length
  );
}

export async function importLegacyWealthStateToSupabase(): Promise<{
  ok: boolean;
  message: string;
  state?: WealthState;
}> {
  if (!hasSupabaseConfig()) {
    return { ok: false, message: "Supabase is not configured." };
  }
  const legacy = readLegacyLocal();
  if (!hasAnyData(legacy)) {
    return { ok: false, message: "No legacy local data found." };
  }
  if (!legacy) {
    return { ok: false, message: "No legacy local data found." };
  }
  const { cleaned } = cleanState(legacy as WealthState);
  const ok = await pushRemoteWealthAll(cleaned);
  if (!ok) {
    return { ok: false, message: "Supabase sync failed. Check RLS policies." };
  }
  setLegacyMigrationFlag();
  clearLegacyLocal();
  return { ok: true, message: "Imported legacy local data.", state: cleaned };
}

export function loadWealthState(): WealthState {
  const local = loadLocal();
  if (hasSupabaseConfig()) {
    return { ...local, flows: [] };
  }
  return local;
}

export function saveWealthState(state: WealthState): void {
  const { cleaned } = cleanState(state);
  saveLocal(cleaned);
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
  const { cleaned: cleanedLocal } = cleanState(local);
  const remote = await fetchRemoteWealthAll();
  if (!remote) return cleanedLocal;

  const { cleaned: cleanedRemote, removedFlowIds: removedRemoteFlowIds } =
    cleanState(remote);
  if (removedRemoteFlowIds.length) {
    await deleteRemoteFlows(removedRemoteFlowIds);
  }

  const cleaned: WealthState = {
    accounts: cleanedRemote.accounts.filter(
      (a) => !SAMPLE_ACCOUNT_IDS.includes(a.id)
    ),
    instruments: cleanedRemote.instruments,
    flows: cleanedRemote.flows.filter((f) => !SAMPLE_FLOW_IDS.includes(f.id)),
  };

  const remoteIsEmpty =
    cleaned.accounts.length === 0 &&
    cleaned.instruments.length === 0 &&
    cleaned.flows.length === 0;

  if (remoteIsEmpty) {
    const legacy = readLegacyLocal();
    if (hasAnyData(legacy)) {
      const { cleaned: cleanedLegacy } = cleanState(legacy as WealthState);
      const ok = await pushRemoteWealthAll(cleanedLegacy);
      if (ok) {
        setLegacyMigrationFlag();
        clearLegacyLocal();
        return cleanedLegacy;
      }
    }
  }

  // If Supabase is empty but local has data, keep local and push up.
  if (
    remoteIsEmpty &&
    (cleanedLocal.accounts.length ||
      cleanedLocal.instruments.length ||
      cleanedLocal.flows.length)
  ) {
    await pushRemoteWealthAll(cleanedLocal);
    saveLocal(cleanedLocal, true);
    return cleanedLocal;
  }

  const wasCleaned =
    cleaned.accounts.length !== cleanedRemote.accounts.length ||
    cleaned.flows.length !== cleanedRemote.flows.length;

  if (wasCleaned) {
    await pushRemoteWealthAll(cleaned);
  }

  // Merge remote with any local additions to avoid accidental wipes.
  const merged: WealthState = {
    accounts: mergeById(cleaned.accounts, cleanedLocal.accounts),
    instruments: mergeById(cleaned.instruments, cleanedLocal.instruments),
    flows: cleaned.flows,
  };

  saveLocal(merged, true);
  return merged;
}

export async function saveWealthStateWithRemote(
  state: WealthState
): Promise<void> {
  const { cleaned, removedFlowIds } = cleanState(state);
  if (hasSupabaseConfig()) {
    // Delete removed flows
    const remoteFlowIds = await fetchRemoteFlowIds();
    const keepFlowIds = new Set(cleaned.flows.map((flow) => flow.id));
    const missingFlowIds = remoteFlowIds
      ? remoteFlowIds.filter((id) => !keepFlowIds.has(id))
      : [];
    const deleteFlowIds = Array.from(
      new Set([...missingFlowIds, ...removedFlowIds])
    );
    if (deleteFlowIds.length) {
      await deleteRemoteFlows(deleteFlowIds);
    }

    // Delete removed instruments
    const remoteInstrumentIds = await fetchRemoteInstrumentIds();
    const keepInstrumentIds = new Set(cleaned.instruments.map((i) => i.id));
    const missingInstrumentIds = remoteInstrumentIds
      ? remoteInstrumentIds.filter((id) => !keepInstrumentIds.has(id))
      : [];
    if (missingInstrumentIds.length) {
      await deleteRemoteInstruments(missingInstrumentIds);
    }
    const ok = await pushRemoteWealthAll(cleaned);
    if (!ok) {
      // keep accounts/instruments locally, but avoid caching flows
      saveLocal(cleaned, true);
      throw new Error("Supabase sync failed. Check RLS or table permissions.");
    }
    saveLocal(cleaned, true);
    return;
  }
  saveLocal(cleaned);
}

export async function resetWealthStateWithRemote(): Promise<WealthState> {
  if (hasSupabaseConfig()) {
    await pushRemoteWealthAll(DEFAULT_STATE);
  }
  saveLocal(DEFAULT_STATE, hasSupabaseConfig());
  return DEFAULT_STATE;
}
