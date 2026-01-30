// app/Dashboard/hooks/useTodoDaily.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { shiftDate } from "@/utils/dates";

export type Category = "life" | "work" | "distraction";

export type RepeatRule =
  | "none"
  | "daily"
  | "weekdays"
  | "weekends"
  | `weekly:Mon` | `weekly:Tue` | `weekly:Wed` | `weekly:Thu` | `weekly:Fri` | `weekly:Sat` | `weekly:Sun`;
const VALID_WEEKDAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as const;
function normalizeRepeat(value: unknown): RepeatRule {
  if (value === "daily" || value === "weekdays" || value === "weekends") return value;
  if (typeof value === "string") {
    if (value === "none") return "none";
    if (value.startsWith("weekly:")) {
      const day = value.slice("weekly:".length);
      if (VALID_WEEKDAYS.includes(day as any)) return value as RepeatRule;
    }
  }
  return "none";
}
function normalizeTask(task: Task): Task {
  return { ...task, repeat: normalizeRepeat((task as any)?.repeat) };
}

export interface Task {
  id: string;
  category: Category;
  title: string;
  note?: string;
  priority: 1 | 2 | 3;
  pinned: boolean;
  due_date?: string | null; // YYYY-MM-DD
  repeat: RepeatRule;
  created_at: string; // ISO
  updated_at: string; // ISO
  status_by_date: Record<string, "done" | "skipped">;
}

export interface DailySelection {
  selected: Partial<Record<Category, string | null>>;
  date: string;
}

const KUWAIT_TZ = "Asia/Kuwait";
function safeNowISO() { return new Date().toISOString(); }
function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return (crypto as any).randomUUID();
  const r=(n:number)=>Math.floor(Math.random()*n).toString(16).padStart(4,"0");
  return `${Date.now().toString(16)}-${r(0xffff)}-${r(0xffff)}-${r(0xffff)}-${r(0xffff)}${r(0xffff)}`;
}
function getTodayInTZ(tz: string = KUWAIT_TZ): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
  const y = parts.find(p=>p.type==="year")?.value ?? "0000";
  const m = parts.find(p=>p.type==="month")?.value ?? "01";
  const d = parts.find(p=>p.type==="day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}
function weekdayNameInTZ(date: Date, tz: string = KUWAIT_TZ): "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun" {
  const parts = new Intl.DateTimeFormat("en-US",{timeZone:tz,weekday:"short"}).formatToParts(date);
  return (parts.find(p=>p.type==="weekday")?.value ?? "Mon").slice(0,3) as any;
}
function matchesRepeat(rule: RepeatRule, dateStr: string, tz: string = KUWAIT_TZ): boolean {
  if (!rule) return false;
  if (rule === "none") return false;
  const [y,m,d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y,m-1,d,12,0,0));
  const wd = weekdayNameInTZ(date,tz);
  if (rule === "daily") return true;
  if (rule === "weekdays") return !["Sat","Sun"].includes(wd);
  if (rule === "weekends") return ["Sat","Sun"].includes(wd);
  if (rule.startsWith("weekly:")) return wd === rule.split(":")[1];
  return false;
}
function compareDates(a?: string | null, b?: string | null): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a < b ? -1 : (a > b ? 1 : 0);
}
function rankCandidates(tasks: Task[]): Task[] {
  return tasks.slice().sort((a,b)=>{
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.priority !== b.priority) return b.priority - a.priority;
    const cd = compareDates(a.due_date, b.due_date); if (cd) return cd;
    return a.created_at.localeCompare(b.created_at);
  });
}
function taskMatchesToday(t: Task, today: string): boolean {
  const hasRepeatToday = matchesRepeat(t.repeat, today);
  const dueToday = !!t.due_date && t.due_date === today;
  return hasRepeatToday || dueToday;
}
function earliestPendingDate(tasks: Task[], today: string): string {
  let focus = today;
  for (const t of tasks) {
    if (!t.due_date) continue;
    if (t.due_date > today) continue;
    const status = t.status_by_date?.[t.due_date];
    if (status === "done" || status === "skipped") continue;
    if (t.due_date < focus) focus = t.due_date;
  }
  return focus;
}

export type SlotState = "pending" | "done" | "idle";

export type SlotInfo = {
  task: Task | null;
  hasAlternate: boolean;
  candidatesCount: number;
  state: SlotState;
  completedTitle?: string;
  completedDueDate?: string | null;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers||{}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export function useTodoDaily() {
  const [today, setToday] = useState<string>(() => getTodayInTZ(KUWAIT_TZ));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selection, setSelection] = useState<DailySelection>(() => ({
    date: getTodayInTZ(KUWAIT_TZ),
    selected: {},
  }));
  const autoAdvanceRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const payload = await api<{tasks:any[]; statuses:any[]}>("/api/todo");
      const byId: Record<string, Task> = {};
      for (const t of payload.tasks) {
        byId[t.id] = {
          id: t.id,
          category: t.category,
          title: t.title,
          note: t.note ?? undefined,
          priority: t.priority,
          pinned: !!t.pinned,
          due_date: t.due_date ?? undefined,
          repeat: normalizeRepeat(t.repeat),
          created_at: t.created_at,
          updated_at: t.updated_at,
          status_by_date: {},
        };
      }
      for (const s of payload.statuses) {
        const task = byId[s.task_id];
        if (task) task.status_by_date[s.date] = s.status;
      }
      const merged = Object.values(byId).map(normalizeTask);
      setTasks(merged);
      const current = getTodayInTZ(KUWAIT_TZ);
      const focus = earliestPendingDate(merged, current);
      setToday(focus);
      setSelection((prev) => (prev.date === focus ? prev : { date: focus, selected: {} }));
    } catch (e) {
      console.warn("TODO DB hydrate failed; staying with in-memory state.", e);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onVis = () => void refresh();
    document.addEventListener("visibilitychange", onVis);
    const timer = setInterval(onVis, 60 * 60 * 1000);
    return () => { document.removeEventListener("visibilitychange", onVis); clearInterval(timer); };
  }, [refresh]);

  const byCategory = useMemo(() => {
    const map: Record<Category, Task[]> = { life:[], work:[], distraction:[] };
    for (const t of tasks) map[t.category].push(t);
    return map;
  }, [tasks]);

  const candidatesByCat = useMemo(() => {
    const cats: Category[] = ["life","work","distraction"];
    const out: Record<Category, Task[]> = { life:[], work:[], distraction:[] };
    for (const c of cats) {
      const cands = byCategory[c].filter(t => {
        const status = t.status_by_date?.[today];
        const notDoneOrSkipped = status !== "done" && status !== "skipped";
        return notDoneOrSkipped && taskMatchesToday(t, today);
      });
      out[c] = rankCandidates(cands);
    }
    return out;
  }, [byCategory, today]);

  const completedByCat = useMemo(() => {
    const cats: Category[] = ["life", "work", "distraction"];
    const map: Record<Category, Task | null> = { life: null, work: null, distraction: null };
    cats.forEach((c) => {
      map[c] = byCategory[c].find((t) => t.status_by_date?.[today] === "done") ?? null;
    });
    return map;
  }, [byCategory, today]);

  const slotInfo = useMemo<Record<Category, SlotInfo>>(() => {
    const info: Record<Category, SlotInfo> = {
      life: { task: null, hasAlternate: false, candidatesCount: 0, state: "idle" },
      work: { task: null, hasAlternate: false, candidatesCount: 0, state: "idle" },
      distraction: { task: null, hasAlternate: false, candidatesCount: 0, state: "idle" },
    };
    (["life", "work", "distraction"] as Category[]).forEach((c) => {
      const cands = candidatesByCat[c];
      const preferredId = selection.selected[c] ?? null;
      const preferred = cands.find((t) => t.id === preferredId) ?? cands[0] ?? null;
      const completed = completedByCat[c];
      const state: SlotState = preferred ? "pending" : completed ? "done" : "idle";
      info[c] = {
        task: preferred ?? null,
        hasAlternate: preferred ? cands.some((t) => t.id !== preferred.id) : false,
        candidatesCount: cands.length,
        state,
        completedTitle: completed?.title,
        completedDueDate: completed?.due_date,
      };
    });
    return info;
  }, [candidatesByCat, selection, completedByCat]);

  const replaceTask = useCallback((t: Task) => {
    setTasks(prev => {
      const idx = prev.findIndex(x => x.id === t.id);
      let tasks = prev.slice();
      if (idx >= 0) tasks[idx] = t; else tasks.push(t);
      return tasks;
    });
  }, []);

  const addQuickTask = useCallback(async (category: Category, title: string, note?: string, priority: 1|2|3 = 2, pinned=false, dueDate?: string | null) => {
    const currentToday = getTodayInTZ(KUWAIT_TZ);
    const requestedDate = dueDate?.trim() || null;
    let targetDate = requestedDate || currentToday;
    if (!requestedDate) {
      // find the earliest date (today forward) with no pending task for this category
      for (let i = 0; i < 365; i += 1) {
        const candidate = shiftDate(currentToday, i);
        const exists = tasks.some((t) => {
          if (t.category !== category) return false;
          if (t.due_date !== candidate) return false;
          const status = t.status_by_date?.[candidate];
          return status !== "done" && status !== "skipped";
        });
        if (!exists) {
          targetDate = candidate;
          break;
        }
      }
    }

    const base: Task = {
      id: uuid(),
      category,
      title: title.trim(),
      note: note?.trim() || undefined,
      priority,
      pinned,
      due_date: targetDate,
      repeat: "none",
      created_at: safeNowISO(),
      updated_at: safeNowISO(),
      status_by_date: {},
    };
    setTasks((prev) => [...prev, base]);
    setSelection((prev) => ({
      date: targetDate,
      selected: { ...prev.selected, [category]: base.id },
    }));

    try {
      const res = await api<{ task: any }>("/api/todo", {
        method: "POST",
        body: JSON.stringify({
          category,
          title: base.title,
          note: base.note,
          priority,
          pinned,
          due_date: base.due_date,
          repeat: base.repeat,
        }),
      });
      const serverTask: Task = {
        ...base,
        id: res.task.id,
        created_at: res.task.created_at,
        updated_at: res.task.updated_at,
      };
      setTasks((prev) => {
        const tasks = prev.slice();
        const idx = tasks.findIndex((t) => t.id === base.id);
        if (idx >= 0) tasks[idx] = serverTask;
        else tasks.push(serverTask);
        return tasks;
      });
      setSelection((prev) => ({
        date: serverTask.due_date || prev.date,
        selected: { ...prev.selected, [category]: serverTask.id },
      }));
    } catch (e) {
      console.warn("DB insert failed; reverting optimistic task.", e);
      setTasks((prev) => prev.filter((t) => t.id !== base.id));
    }
  }, [tasks]);

  const markDone = useCallback(async (category: Category) => {
    const t = slotInfo[category].task; if (!t) return;
    replaceTask({ ...t, status_by_date: { ...(t.status_by_date||{}), [today]: "done" }, updated_at: safeNowISO() });
    try { await api("/api/todo/status", { method:"POST", body: JSON.stringify({ task_id: t.id, date: today, status: "done" })}); }
    catch(e){ console.warn("DB status failed", e); }
  }, [slotInfo, today, replaceTask]);

  const skipTask = useCallback( async (category: Category) => {
    const t = slotInfo[category].task; if (!t) return;
    replaceTask({ ...t, status_by_date: { ...(t.status_by_date||{}), [today]: "skipped" }, updated_at: safeNowISO() });
    try { await api("/api/todo/status", { method:"POST", body: JSON.stringify({ task_id: t.id, date: today, status: "skipped" })}); }
    catch(e){ console.warn("DB status failed", e); }
  }, [slotInfo, today, replaceTask]);

  const showNext = useCallback((category: Category) => {
    const cands = candidatesByCat[category];
    const curId = slotInfo[category].task?.id;
    const next = cands.find(t => t.id !== curId);
    setSelection(prev => ({ date: today, selected: { ...prev.selected, [category]: next?.id ?? null } }));
  }, [candidatesByCat, slotInfo, today]);

  const deleteTask = useCallback(async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSelection(prev => {
      const sel = { ...prev.selected };
      (["life","work","distraction"] as Category[]).forEach(c => { if (sel[c] === taskId) sel[c] = null; });
      return { date: prev.date, selected: sel };
    });
    try { await api(`/api/todo?id=${encodeURIComponent(taskId)}`, { method: "DELETE" }); }
    catch(e){ console.warn("DB delete failed", e); void refresh(); }
  }, [refresh]);

  const editTask = useCallback(async (taskId: string, patch: Partial<Pick<Task,"title"|"note"|"priority"|"pinned"|"due_date"|"repeat">>) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === taskId);
      if (idx === -1) return prev;
      const tasks = prev.slice();
      tasks[idx] = { ...tasks[idx], ...patch, updated_at: safeNowISO() };
      return tasks;
    });
    try { await api(`/api/todo?id=${encodeURIComponent(taskId)}`, { method:"PATCH", body: JSON.stringify(patch) }); }
    catch(e){ console.warn("DB patch failed", e); void refresh(); }
  }, [refresh]);

  const setTaskStatus = useCallback(
    async (
      taskId: string,
      date: string,
      nextStatus: "done" | "skipped" | "pending"
    ) => {
      setTasks((prev) => {
        const idx = prev.findIndex((t) => t.id === taskId);
        if (idx === -1) return prev;
        const tasks = prev.slice();
        const statuses = { ...(tasks[idx].status_by_date || {}) };
        if (nextStatus === "pending") {
          delete statuses[date];
        } else {
          statuses[date] = nextStatus;
        }
        tasks[idx] = {
          ...tasks[idx],
          status_by_date: statuses,
          updated_at: safeNowISO(),
        };
        return tasks;
      });
      try {
        if (nextStatus === "pending") {
          const qs = new URLSearchParams({ task_id: taskId, date });
          await api(`/api/todo/status?${qs.toString()}`, { method: "DELETE" });
        } else {
          await api("/api/todo/status", {
            method: "POST",
            body: JSON.stringify({ task_id: taskId, date, status: nextStatus }),
          });
        }
      } catch (e) {
        console.warn("DB status update failed", e);
        void refresh();
      }
    },
    [refresh]
  );

  useEffect(() => {
    const current = getTodayInTZ(KUWAIT_TZ);
    const focus = earliestPendingDate(tasks, current);
    const isAutoAdvancedFuture = today > current && focus === current;
    if (focus !== today && !isAutoAdvancedFuture) {
      setToday(focus);
      setSelection({ date: focus, selected: {} });
    }
  }, [tasks, today]);

  useEffect(() => {
    const cats: Category[] = ["life", "work", "distraction"];
    const hasPending = cats.some((c) => slotInfo[c]?.state === "pending" && slotInfo[c]?.task);
    if (hasPending) {
      autoAdvanceRef.current = null;
      return;
    }
    const hasCompleted = cats.some((c) => slotInfo[c]?.state === "done");
    if (!hasCompleted) return;
    if (autoAdvanceRef.current === today) return;
    autoAdvanceRef.current = today;
    // Increased delay for smoother animation (2 seconds total transition)
    const timer = setTimeout(() => {
      setToday((prev) => {
        const nextDay = shiftDate(prev, 1);
        setSelection({ date: nextDay, selected: {} });
        return nextDay;
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [slotInfo, today]);

  return {
    today,
    slotInfo,
    selection,
    tasks,
    refresh,
    addQuickTask,
    markDone,
    skipTask,
    showNext,
    deleteTask,
    editTask,
    setTaskStatus,
    advanceToNextDay: () => {
      setToday((prev) => {
        const next = shiftDate(prev, 1);
        setSelection({ date: next, selected: {} });
        return next;
      });
    },
  };
}
