// app/TODO/page.tsx
"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useTodoDaily } from "../dashboard/hooks/useTodoDaily";
import type { Task, Category } from "../dashboard/hooks/useTodoDaily";
import {
  snapshotStorage,
  waitForUserStorage,
  subscribe,
  setItem,
  getItem,
} from "@/lib/user-storage";
import { shiftDate } from "@/utils/dates";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SparklesIcon,
  CalendarAdd02Icon,
  Calendar02Icon,
  CheckListIcon,
  ShuffleIcon,
} from "@hugeicons/core-free-icons";

type StatusTone = "pending" | "done" | "skipped";
type StatusResolution = { label: string; tone: StatusTone; dateLabel: string };
type DragState = { id: string; category: Category } | null;
type DropTarget = {
  category: Category;
  id: string | null;
  position: "before" | "after";
} | null;

const LABELS: Record<Category, string> = {
  life: "Life",
  work: "Work",
  distraction: "Distraction",
};

const HINTS: Record<Category, string> = {
  life: "Use this for home, errands, relationships, errands, and anything that keeps your life moving.",
  work: "Tasks related to your job, GAIA building, study sessions, and deep work blocks.",
  distraction:
    "Things you want to deliberately enjoy or limit: games, scrolling, and time sinks.",
};

const CATEGORY_ORDER: Category[] = ["life", "work", "distraction"];
const EMPTY_DRAFTS: Record<Category, string> = {
  life: "",
  work: "",
  distraction: "",
};
type NavFilter = "day" | "tomorrow" | "week" | "all" | "custom";
const NAV_FILTER_KEY = "gaia.todo.v2.0.6.filter";
const NAV_CUSTOM_DATE_KEY = "gaia.todo.v2.0.6.filter.date";

function isNavFilter(value: unknown): value is NavFilter {
  return (
    value === "day" ||
    value === "tomorrow" ||
    value === "week" ||
    value === "all" ||
    value === "custom"
  );
}

function formatShortDate(value?: string | null) {
  if (!value || value === "Unscheduled") return value ?? "Unscheduled";
  try {
    const date = new Date(value + "T00:00:00Z");
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return value;
  }
}

function compareDueDate(a?: string | null, b?: string | null) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return b.localeCompare(a);
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function todayInput(): string {
  return new Date().toISOString().slice(0, 10);
}

const KUWAIT_TZ = "Asia/Kuwait";
function todayInTZ(tz: string = KUWAIT_TZ): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

export default function TODOPage() {
  const {
    tasks,
    today,
    refresh,
    deleteTask,
    addQuickTask,
    editTask,
    setTaskStatus,
  } = useTodoDaily();
  const [storageStatus, setStorageStatus] = useState({
    synced: false,
    hasTasks: false,
  });
  const [drafts, setDrafts] = useState<Record<Category, string>>(EMPTY_DRAFTS);
  const [draftsDue, setDraftsDue] = useState<Record<Category, string>>({
    life: todayInput(),
    work: todayInput(),
    distraction: todayInput(),
  });
  const [orderMap, setOrderMap] = useState<Record<Category, string[]>>({
    life: [],
    work: [],
    distraction: [],
  });
  const [hydrated, setHydrated] = useState(false);
  const [dragging, setDragging] = useState<DragState>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);
  const todayMeta = useMemo(() => {
    try {
      const date = new Date(`${today}T00:00:00`);
      return {
        dayName: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
          date
        ),
        monthName: new Intl.DateTimeFormat("en-US", { month: "long" }).format(
          date
        ),
        monthShort: new Intl.DateTimeFormat("en-US", { month: "short" }).format(
          date
        ),
        dayNumber: date.getDate(),
      };
    } catch {
      return { dayName: "Today", monthName: "", monthShort: "", dayNumber: 0 };
    }
  }, [today]);
  const heroMeta = useMemo(() => {
    const now = new Date();
    return {
      dayName: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
        now
      ),
      monthName: new Intl.DateTimeFormat("en-US", { month: "long" }).format(
        now
      ),
      monthShort: new Intl.DateTimeFormat("en-US", { month: "short" }).format(
        now
      ),
      dayNumber: now.getDate(),
    };
  }, [today]);
  const completion = useMemo(() => {
    let done = 0;
    tasks.forEach((t) => {
      const status = t.status_by_date?.[today];
      if (status === "done") done += 1;
    });
    return { done, total: tasks.length };
  }, [tasks, today]);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);
  const calendarToday = useMemo(() => todayInTZ(), []);
  const [customDate, setCustomDate] = useState<string>(() => {
    const cached = getItem(NAV_CUSTOM_DATE_KEY);
    if (typeof cached === "string" && cached.trim().match(/^\d{4}-\d{2}-\d{2}$/))
      return cached;
    return calendarToday;
  });
  const counts = useMemo(() => {
    const todayDate = parseDate(calendarToday);
    const customDateParsed = parseDate(customDate);
    let todayPending = 0;
    let tomorrowPending = 0;
    let nextSeven = 0;
    let customPending = 0;
    let allPending = 0;
    tasks.forEach((t) => {
      const status = t.status_by_date?.[calendarToday];
      const isDone = status === "done" || status === "skipped";
      if (!isDone) allPending += 1;
      const due = parseDate(t.due_date);
      if (due && todayDate) {
        const diffDays = Math.round(
          (due.getTime() - todayDate.getTime()) / 86400000
        );
        if (!isDone && diffDays === 0) todayPending += 1;
        if (!isDone && diffDays === 1) tomorrowPending += 1;
        if (!isDone && diffDays >= 1 && diffDays <= 7) nextSeven += 1;
      }
      if (!isDone && customDateParsed && due) {
        const diffCustom = Math.round(
          (due.getTime() - customDateParsed.getTime()) / 86400000
        );
        if (diffCustom === 0) customPending += 1;
      }
    });
    return { todayPending, tomorrowPending, nextSeven, customPending, allPending };
  }, [tasks, calendarToday, customDate]);
  const navItems = [
    {
      key: "day",
      label: "My Day",
      count: counts.todayPending,
      helper: "Due today",
      icon: <HugeiconsIcon icon={SparklesIcon} size={16} />,
    },
    {
      key: "tomorrow",
      label: "Tomorrow",
      count: counts.tomorrowPending,
      helper: "Due tomorrow",
      icon: <HugeiconsIcon icon={CalendarAdd02Icon} size={16} />,
    },
    {
      key: "week",
      label: "Next 7 days",
      count: counts.nextSeven,
      helper: "Upcoming week",
      icon: <HugeiconsIcon icon={Calendar02Icon} size={16} />,
    },
    {
      key: "custom",
      label: "Pick a date",
      count: counts.customPending,
      helper: formatShortDate(customDate),
      icon: <HugeiconsIcon icon={Calendar02Icon} size={16} />,
    },
    {
      key: "all",
      label: "All tasks",
      count: counts.allPending,
      helper: "Pending total",
      icon: <HugeiconsIcon icon={CheckListIcon} size={16} />,
    },
  ];
  const [navActive, setNavActive] = useState<NavFilter>(() => {
    const cached = snapshotStorage()[NAV_FILTER_KEY] ?? getItem(NAV_FILTER_KEY);
    return isNavFilter(cached) ? cached : "day";
  });

  useEffect(() => {
    let cancelled = false;
    const update = () => {
      const snapshot = snapshotStorage();
      const hasSupabase = snapshot["gaia.todo.supabase.synced"] === "true";
      const localRaw = snapshot["gaia.todo.v2.0.6"];
      const hasTasks =
        typeof localRaw === "string" && !localRaw.includes('"tasks":[]');
      const savedFilter = snapshot[NAV_FILTER_KEY] ?? null;
      if (isNavFilter(savedFilter)) {
        setNavActive(savedFilter);
      }
      setStorageStatus({ synced: hasSupabase, hasTasks });
    };
    (async () => {
      try {
        await waitForUserStorage();
        if (cancelled) return;
        update();
      } catch {
        if (!cancelled) setStorageStatus({ synced: false, hasTasks: false });
      }
    })();
    const unsub = subscribe(({ key }) => {
      if (!key) return;
      if (key.startsWith("gaia.todo")) update();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const byCat = useMemo(() => {
    const map: Record<Category, Task[]> = {
      life: [],
      work: [],
      distraction: [],
    };
    for (const t of tasks) map[t.category].push(t);
    return map;
  }, [tasks]);

  const orderedByCat = useMemo(() => {
    const map: Record<Category, Task[]> = {
      life: [],
      work: [],
      distraction: [],
    };
    (Object.keys(byCat) as Category[]).forEach((cat) => {
      const order = orderMap[cat] ?? [];
      map[cat] = byCat[cat]
        .slice()
        .sort((a, b) => {
          const ia = order.indexOf(a.id);
          const ib = order.indexOf(b.id);
          if (ia !== -1 && ib !== -1) return ia - ib;
          if (ia !== -1) return -1;
          if (ib !== -1) return 1;
          return b.created_at.localeCompare(a.created_at);
        });
    });
    return map;
  }, [byCat, orderMap]);

  useEffect(() => {
    setOrderMap((prev) => {
      const next: Record<Category, string[]> = { ...prev };
      (Object.keys(byCat) as Category[]).forEach((cat) => {
        const existing = prev[cat] ?? [];
        const ids = byCat[cat].map((t) => t.id);
        const merged = existing.filter((id) => ids.includes(id));
        ids.forEach((id) => {
          if (!merged.includes(id)) merged.push(id);
        });
        next[cat] = merged;
      });
      return next;
    });
  }, [byCat]);

  const filteredByCat = useMemo<Record<Category, Task[]>>(() => {
    if (navActive === "all") return orderedByCat;
    const tomorrow = shiftDate(calendarToday, 1);
    const endOfWeek = shiftDate(calendarToday, 7);
    const targetCustom = customDate;
    const map: Record<Category, Task[]> = {
      life: [],
      work: [],
      distraction: [],
    };
    (Object.keys(orderedByCat) as Category[]).forEach((cat) => {
      map[cat] = orderedByCat[cat].filter((t) => {
        if (!t.due_date || t.due_date === "Unscheduled") return false;
        if (navActive === "day") return t.due_date === calendarToday;
        if (navActive === "tomorrow") return t.due_date === tomorrow;
        if (navActive === "custom") return t.due_date === targetCustom;
        return t.due_date > calendarToday && t.due_date <= endOfWeek;
      });
    });
    return map;
  }, [navActive, orderedByCat, calendarToday, customDate]);

  const resolveStatus = useCallback((task: Task): StatusResolution => {
    const entries = Object.entries(task.status_by_date ?? {});
    let tone: StatusTone = "pending";
    if (entries.length > 0) {
      entries.sort((a, b) => b[0].localeCompare(a[0]));
      const [, status] = entries[0];
      tone =
        status === "done"
          ? "done"
          : status === "skipped"
          ? "skipped"
          : "pending";
    }
    return {
      label:
        tone === "done" ? "Done" : tone === "skipped" ? "Skipped" : "Pending",
      tone,
      dateLabel: task.due_date ?? "Unscheduled",
    };
  }, []);

  const toneStyles: Record<StatusTone, string> = {
    pending:
      "bg-[color-mix(in_srgb,var(--gaia-warning)_18%,transparent)] text-[var(--gaia-text-strong)] ring-1 ring-[color-mix(in_srgb,var(--gaia-warning)_45%,transparent)]",
    done: "bg-[color-mix(in_srgb,var(--gaia-positive)_18%,transparent)] text-[var(--gaia-text-strong)] ring-1 ring-[color-mix(in_srgb,var(--gaia-positive)_45%,transparent)]",
    skipped:
      "bg-[color-mix(in_srgb,var(--gaia-text-muted)_22%,transparent)] text-[var(--gaia-text-strong)] ring-1 ring-[color-mix(in_srgb,var(--gaia-border)_70%,transparent)]",
  };

  const handleAdd = useCallback(
    async (category: Category) => {
      const title = drafts[category]?.trim();
      if (!title) return;
      const due = draftsDue[category]?.trim() || null;
      try {
        await addQuickTask(category, title, undefined, 2, false, due);
      } finally {
        setDrafts((prev) => ({ ...prev, [category]: "" }));
        setDraftsDue((prev) => ({ ...prev, [category]: todayInput() }));
      }
    },
    [addQuickTask, drafts, draftsDue]
  );

  const handleDateChange = useCallback(
    (taskId: string, nextValue: string) => {
      const normalized = nextValue.trim();
      editTask(taskId, { due_date: normalized ? normalized : null });
    },
    [editTask]
  );

  const handleStatusChange = useCallback(
    (task: Task, next: StatusTone) => {
      const targetDate =
        task.due_date && task.due_date !== "Unscheduled"
          ? task.due_date
          : today;
      setTaskStatus(task.id, targetDate, next);
    },
    [setTaskStatus, today]
  );

  const resequenceCategory = useCallback(
    async (category: Category, prevOrder: Task[], nextOrder: Task[]) => {
      if (prevOrder.length === 0 || nextOrder.length === 0) return;
      const dueSlots = prevOrder.map((t) => t.due_date ?? null);
      const updates: Promise<unknown>[] = [];
      nextOrder.forEach((task, idx) => {
        const desiredDate = dueSlots[idx] ?? null;
        if (task.due_date !== desiredDate) {
          updates.push(editTask(task.id, { due_date: desiredDate }));
        }
      });
      await Promise.all(updates);
    },
    [editTask]
  );

  const handleReorder = useCallback(
    async (
      category: Category,
      sourceId: string,
      targetId: string | null,
      position: "before" | "after"
    ) => {
      const list = filteredByCat[category];
      const currentIdx = list.findIndex((t) => t.id === sourceId);
      if (currentIdx === -1) return;
      const next = list.slice();
      const [item] = next.splice(currentIdx, 1);
      let insertAt = next.length;
      if (targetId) {
        const targetIdx = next.findIndex((t) => t.id === targetId);
        if (targetIdx !== -1) {
          insertAt = position === "after" ? targetIdx + 1 : targetIdx;
        }
      }
      next.splice(insertAt, 0, item);
      await resequenceCategory(category, list, next);
      setOrderMap((prev) => ({
        ...prev,
        [category]: next.map((t) => t.id),
      }));
      setDragging(null);
      setDropTarget(null);
    },
    [filteredByCat, resequenceCategory]
  );

  const dragIndicator = (taskId: string, category: Category) => {
    if (!dragging || dragging.category !== category) return "";
    if (dragging.id === taskId)
      return "ring-2 ring-sky-400/70 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]";
    if (dropTarget?.id === taskId && dropTarget.category === category) {
      return dropTarget.position === "before"
        ? "border-t border-sky-400/70"
        : "border-b border-sky-400/70";
    }
    return "";
  };

  const navTargets = useMemo<Record<NavFilter, string>>(
    () => ({
      day: "todo-hero",
      tomorrow: "todo-grid",
      week: "todo-grid",
      custom: "todo-grid",
      all: "todo-grid-bottom",
    }),
    []
  );

  const persistNavFilter = useCallback((key: NavFilter) => {
    setNavActive(key);
    setItem(NAV_FILTER_KEY, key);
  }, []);

  const handleNavClick = useCallback(
    (key: NavFilter) => {
      persistNavFilter(key);
      const targetId = navTargets[key];
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [navTargets, persistNavFilter]
  );

  if (!hydrated) {
    return <main className="relative w-[100vw] gaia-surface text-[var(--gaia-text-default)]" />;
  }

  return (
    <main className="relative w-[100vw] gaia-surface text-[var(--gaia-text-default)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_color-mix(in_srgb,var(--gaia-contrast-bg)_35%,transparent),_color-mix(in_srgb,var(--gaia-surface-soft)_18%,transparent),transparent)] blur-3xl" />
        <div className="absolute -right-10 top-56 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,_color-mix(in_srgb,var(--gaia-positive)_32%,transparent),_color-mix(in_srgb,var(--gaia-contrast-bg)_12%,transparent),transparent)] blur-3xl" />
        <div className="absolute -left-52 top-10 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,_color-mix(in_srgb,var(--gaia-info)_22%,transparent),_color-mix(in_srgb,var(--gaia-contrast-bg)_10%,transparent),transparent)] blur-3xl" />
      </div>

      <div className="relative mx-auto w-[75vw] px-4 py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
          <aside className="sticky top-6 h-[80vh] overflow-auto rounded-2xl border gaia-border bg-[var(--gaia-surface)] p-4 shadow-xl shadow-black/15">
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gaia-text-muted)]">
                Navigation
              </p>
              <h3 className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                Today & beyond
              </h3>
            </div>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.key as "day" | "week" | "all")}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold text-[var(--gaia-text-default)] shadow-sm transition hover:border-[var(--gaia-contrast-bg)] hover:shadow ${
                      navActive === item.key
                        ? "border-[var(--gaia-contrast-bg)] bg-[color-mix(in_srgb,var(--gaia-contrast-bg)_12%,transparent)]"
                        : "gaia-border bg-[var(--gaia-surface-soft)]"
                    }`}
                  >
                    <div className="flex flex-col leading-tight text-left">
                      <span className="flex items-center gap-2 text-[var(--gaia-text-strong)]">
                        {item.icon}
                        {item.label}
                      </span>
                      <span className="text-[11px] font-medium text-[var(--gaia-text-muted)]">
                        {item.helper}
                      </span>
                    </div>
                    <span className="rounded-full bg-[var(--gaia-surface)] px-3 py-1 text-xs font-bold text-[var(--gaia-text-strong)] ring-1 ring-[var(--gaia-border)]">
                      {item.count}
                    </span>
                  </button>
                  {item.key === "custom" && (
                    <div className="mt-2 flex items-center gap-2">
                      <label className="sr-only" htmlFor="custom-date">
                        Pick a date
                      </label>
                      <input
                        id="custom-date"
                        type="date"
                        className="w-full rounded-lg border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-2 text-sm text-[var(--gaia-text-default)]"
                        value={customDate}
                        onChange={(e) => {
                          const next = e.target.value || calendarToday;
                          setCustomDate(next);
                          setItem(NAV_CUSTOM_DATE_KEY, next);
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-2">
                <p className="text-[var(--gaia-text-muted)]">Synced</p>
                <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                  {storageStatus.synced ? "Yes" : "Local"}
                </p>
              </div>
              <div className="rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-2">
                <p className="text-[var(--gaia-text-muted)]">Done today</p>
                <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                  {completion.done}
                </p>
              </div>
            </div>
          </aside>

          <div className="space-y-8" id="todo-main">
            <div id="todo-hero" />
            <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--gaia-text-muted)]">
                  My Day
                </p>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight text-[var(--gaia-text-strong)] sm:text-5xl">
                    {greeting}, Mostafa.
                  </h1>
                  <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                    What will you accomplish today?
                  </p>
                  <p className="max-w-2xl text-sm text-[var(--gaia-text-muted)]">
                    Drag to reorder tasks inside each category. Dropping a task
                    pushes its scheduled date forward or backward automatically
                    so every category keeps one task per day.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--gaia-positive)_16%,transparent)] px-3 py-1 font-semibold text-[var(--gaia-text-strong)] ring-1 ring-[color-mix(in_srgb,var(--gaia-positive)_45%,transparent)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--gaia-positive)]" />
                    {storageStatus.synced
                      ? "Backed up to Supabase"
                      : "Local only"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--gaia-surface-soft)] px-3 py-1 font-medium text-[var(--gaia-text-default)] ring-1 ring-[var(--gaia-border)]">
                    Cache {storageStatus.hasTasks ? "present" : "empty"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--gaia-surface-soft)] px-3 py-1 font-medium text-[var(--gaia-text-default)] ring-1 ring-[var(--gaia-border)]">
                    {completion.done} / {completion.total || 1} done today
                  </span>
                </div>
              </div>

              <div className="w-full max-w-sm overflow-hidden rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] shadow-2xl shadow-black/20 backdrop-blur">
                <div className="flex items-center justify-between border-b gaia-border px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
                      Today
                    </p>
                    <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                      {heroMeta.dayName}
                    </p>
                  </div>
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--gaia-info)_16%,transparent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--gaia-text-strong)] ring-1 ring-[color-mix(in_srgb,var(--gaia-info)_45%,transparent)]">
                    Focus
                  </span>
                </div>
                <div className="flex items-end gap-3 px-4 pb-4 pt-5">
                  <div className="text-5xl font-bold leading-none text-[var(--gaia-text-strong)]">
                    {heroMeta.dayNumber}
                  </div>
                  <div className="space-y-1 text-sm text-[var(--gaia-text-default)]">
                    <div className="font-semibold">{heroMeta.monthName}</div>
                    <div className="text-[var(--gaia-text-muted)]">
                      {heroMeta.monthShort}
                    </div>
                  </div>
                  <div className="ml-auto flex flex-col items-end gap-1 text-xs text-[var(--gaia-text-muted)]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--gaia-surface)] px-2 py-1 font-semibold text-[var(--gaia-text-default)] ring-1 ring-[var(--gaia-border)]">
                      {tasks.length} tasks
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--gaia-positive)_16%,transparent)] px-2 py-1 font-semibold text-[var(--gaia-text-strong)] ring-1 ring-[color-mix(in_srgb,var(--gaia-positive)_35%,transparent)]">
                      {completion.done} completed
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t gaia-border px-4 py-3 text-[11px] text-[var(--gaia-text-default)]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--gaia-surface)] px-3 py-1 font-semibold ring-1 ring-[var(--gaia-border)]">
                    <HugeiconsIcon
                      icon={ShuffleIcon}
                      size={12}
                      color="var(--gaia-info)"
                    />
                    Drag to reorder
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--gaia-surface)] px-3 py-1 font-semibold ring-1 ring-[var(--gaia-border)]">
                    <HugeiconsIcon
                      icon={Calendar02Icon}
                      size={12}
                      color="var(--gaia-positive)"
                    />
                    Auto reschedules dates
                  </span>
                </div>
              </div>
            </header>

            <div className="mt-8 space-y-5" id="todo-grid">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {CATEGORY_ORDER.map((cat) => (
                  <section
                    key={cat}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] shadow-xl shadow-black/20 backdrop-blur transition hover:border-[var(--gaia-contrast-bg)]/70"
                  >
                    <div className="flex items-start justify-between border-b gaia-border px-4 py-4">
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold tracking-tight text-[var(--gaia-text-strong)]">
                          {LABELS[cat]}
                        </h2>
                        <p className="text-xs text-[var(--gaia-text-muted)]">
                          {HINTS[cat]}
                        </p>
                      </div>
                    </div>

                    <form
                      className="flex flex-wrap items-center gap-2 border-b gaia-border bg-[var(--gaia-surface)] px-4 py-3 text-sm"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void handleAdd(cat);
                      }}
                    >
                      <label className="sr-only" htmlFor={`todo-add-${cat}`}>
                        Add {LABELS[cat]} task
                      </label>
                      <input
                        id={`todo-add-${cat}`}
                        className="flex-1 rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-2 text-sm text-[var(--gaia-text-default)] placeholder:text-[var(--gaia-text-muted)] shadow-inner shadow-black/10 focus:border-[var(--gaia-contrast-bg)] focus:outline-none"
                        placeholder={`Add a ${LABELS[cat]} task...`}
                        value={drafts[cat]}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [cat]: e.target.value,
                          }))
                        }
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          className="w-[140px] rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-2 text-sm text-[var(--gaia-text-default)]"
                          value={draftsDue[cat]}
                          onChange={(e) =>
                            setDraftsDue((prev) => ({
                              ...prev,
                              [cat]: e.target.value || todayInput(),
                            }))
                          }
                        />
                        <span className="text-xs font-semibold text-[var(--gaia-text-muted)]">
                          {formatShortDate(draftsDue[cat])}
                        </span>
                      </div>
                      <button
                        type="submit"
                        className="rounded-xl bg-[var(--gaia-contrast-bg)] px-4 py-2 text-sm font-semibold text-[var(--gaia-contrast-text)] shadow-lg shadow-black/10 transition hover:translate-y-px hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!drafts[cat].trim()}
                      >
                        Add
                      </button>
                    </form>

                    <div className="flex flex-1 flex-col">
                      {filteredByCat[cat].length === 0 ? (
                        <div className="space-y-2 px-4 py-6 text-sm text-[var(--gaia-text-muted)]">
                          <p className="font-semibold text-[var(--gaia-text-strong)]">
                            No tasks yet.
                          </p>
                          <p>
                            Add one above or quick-add from the dashboard -
                            everything syncs here automatically.
                          </p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-[var(--gaia-border)]/60">
                          {filteredByCat[cat].map((t) => {
                            const statusMeta = resolveStatus(t);
                            const dueLabel = formatShortDate(
                              t.due_date ?? statusMeta.dateLabel
                            );
                            const clampStyle = {
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical" as const,
                              overflow: "hidden",
                            };

                            return (
                              <TaskDraggable
                                key={t.id}
                                task={t}
                                category={cat}
                                className={`relative flex min-h-[170px] flex-col gap-3 overflow-hidden p-4 transition duration-150 ${dragIndicator(
                                  t.id,
                                  cat
                                )}`}
                                onReorder={handleReorder}
                                setDragging={setDragging}
                                setDropTarget={setDropTarget}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--gaia-surface)] text-[11px] font-bold uppercase text-[var(--gaia-text-default)] ring-1 ring-[var(--gaia-border)] cursor-grab active:cursor-grabbing flex-shrink-0">
                                    ?
                                  </span>
                                  <div className="flex-1 space-y-3 overflow-hidden">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-1 space-y-1 overflow-hidden">
                                        <div
                                          className="text-base font-semibold leading-tight text-[var(--gaia-text-strong)]"
                                          style={clampStyle}
                                          title={t.title}
                                        >
                                          {t.title}
                                        </div>
                                        {t.repeat && t.repeat !== "none" && (
                                          <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                                            Repeats: {String(t.repeat)}
                                          </p>
                                        )}
                                      </div>
                                      <button
                                        className="ml-2 inline-flex items-center self-start rounded-lg bg-[color-mix(in_srgb,var(--gaia-negative)_16%,transparent)] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--gaia-text-strong)] ring-1 ring-[color-mix(in_srgb,var(--gaia-negative)_45%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--gaia-negative)_22%,transparent)]"
                                        onClick={() => deleteTask(t.id)}
                                        title="Delete task"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                    <div className="flex w-full flex-wrap items-center gap-2 rounded-xl bg-[var(--gaia-surface)] px-3 py-2 text-xs text-[var(--gaia-text-default)] shadow-inner shadow-black/5">
                                      <label
                                        className={`flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 font-semibold shadow-sm sm:w-auto ${
                                          toneStyles[statusMeta.tone]
                                        }`}
                                      >
                                        <select
                                          aria-label="Task status"
                                          className="rounded border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[var(--gaia-text-default)]"
                                          value={statusMeta.tone}
                                          onChange={(e) =>
                                            handleStatusChange(
                                              t,
                                              e.target.value as StatusTone
                                            )
                                          }
                                        >
                                          <option value="pending">
                                            Pending
                                          </option>
                                          <option value="done">Done</option>
                                          <option value="skipped">
                                            Skipped
                                          </option>
                                        </select>
                                      </label>
                                      <div className="flex w-full flex-wrap items-center gap-2 rounded-lg bg-[var(--gaia-surface)] px-3 py-2 font-semibold text-[var(--gaia-text-default)] ring-1 ring-[var(--gaia-border)] sm:w-auto">
                                        <span>Due</span>
                                        <input
                                          type="date"
                                          className="min-w-[140px] rounded border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[var(--gaia-text-default)] sm:min-w-[0]"
                                          value={t.due_date ?? ""}
                                          min="2025-01-01"
                                          max="2030-12-31"
                                          onChange={(e) =>
                                            handleDateChange(
                                              t.id,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TaskDraggable>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
            <div id="todo-grid-bottom" />
          </div>
        </div>
      </div>
    </main>
  );
}

type StatusRowProps = {
  task: Task;
  toneStyles: Record<StatusTone, string>;
  status: StatusResolution;
};

type TaskDraggableProps = {
  task: Task;
  category: Category;
  className?: string;
  onReorder: (
    category: Category,
    sourceId: string,
    targetId: string | null,
    position: "before" | "after"
  ) => void;
  setDragging: (state: DragState) => void;
  setDropTarget: (state: DropTarget) => void;
  children: ReactNode;
};

function TaskDraggable({
  task,
  category,
  className,
  onReorder,
  setDragging,
  setDropTarget,
  children,
}: TaskDraggableProps) {
  const ref = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cleanupDraggable = draggable({
      element: el,
      getInitialData: () => ({ taskId: task.id, category }),
      onDragStart: () => setDragging({ id: task.id, category }),
      onDrop: () => {
        setDragging(null);
        setDropTarget(null);
      },
    });

    const cleanupDropTarget = dropTargetForElements({
      element: el,
      getData: ({ input }) => {
        if (!ref.current) return {};
        const { top, height } = ref.current.getBoundingClientRect();
        const before = input.clientY < top + height / 2;
        return {
          taskId: task.id,
          category,
          position: before ? "before" : "after",
        };
      },
      canDrop: ({ source }) =>
        (source.data as any)?.category === category &&
        (source.data as any)?.taskId !== task.id,
      onDragEnter: ({ self }) => {
        const pos =
          (self.data as any)?.position === "before" ? "before" : "after";
        setDropTarget({ id: task.id, category, position: pos });
      },
      onDragLeave: () => setDropTarget(null),
      onDrop: ({ source, self }) => {
        const sourceId = (source.data as any)?.taskId as string | undefined;
        const pos =
          (self.data as any)?.position === "before" ? "before" : "after";
        if (sourceId) {
          onReorder(category, sourceId, task.id, pos);
        }
        setDropTarget(null);
      },
    });

    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [task.id, category, onReorder, setDragging, setDropTarget]);

  return (
    <li ref={ref} className={className}>
      {children}
    </li>
  );
}

function StatusRow({ task, toneStyles, status }: StatusRowProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2 text-xs">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
          toneStyles[status.tone]
        }`}
      >
        {status.label}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--gaia-surface)] px-2 py-0.5 text-[var(--gaia-text-default)] ring-1 ring-[var(--gaia-border)]">
        Due: {formatShortDate(task.due_date ?? status.dateLabel)}
      </span>
    </div>
  );
}
