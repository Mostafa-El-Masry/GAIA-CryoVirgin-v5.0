// app/TODO/page.tsx
"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useTodoDaily } from "../dashboard/hooks/useTodoDaily";
import type { Task, Category } from "../dashboard/hooks/useTodoDaily";
import {
  snapshotStorage,
  waitForUserStorage,
  subscribe,
} from "@/lib/user-storage";
import { shiftDate } from "@/utils/dates";

type StatusTone = "pending" | "done" | "skipped";
type StatusResolution = { label: string; tone: StatusTone; dateLabel: string };
type DragState = { id: string; category: Category } | null;
type DropTarget = { category: Category; id: string | null; position: "before" | "after" } | null;

const LABELS: Record<Category, string> = {
  life: "Life",
  work: "Work",
  distraction: "Distraction",
};

const HINTS: Record<Category, string> = {
  life: "Use this for home, errands, relationships, errands, and anything that keeps your life moving.",
  work: "Tasks related to your job, GAIA building, study sessions, and deep work blocks.",
  distraction: "Things you want to deliberately enjoy or limit: games, scrolling, and time sinks.",
};

const CATEGORY_ORDER: Category[] = ["life", "work", "distraction"];
const EMPTY_DRAFTS: Record<Category, string> = {
  life: "",
  work: "",
  distraction: "",
};

function formatShortDate(value?: string | null) {
  if (!value || value === "Unscheduled") return value ?? "Unscheduled";
  try {
    const date = new Date(value + "T00:00:00Z");
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
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
  return a.localeCompare(b);
}

export default function TODOPage() {
  const {
    tasks,
    today,
    deleteTask,
    addQuickTask,
    editTask,
    setTaskStatus,
  } = useTodoDaily();
  const [storageStatus, setStorageStatus] = useState({ synced: false, hasTasks: false });
  const [drafts, setDrafts] = useState<Record<Category, string>>(EMPTY_DRAFTS);
  const [dragging, setDragging] = useState<DragState>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);

  useEffect(() => {
    let cancelled = false;
    const update = () => {
      const snapshot = snapshotStorage();
      const hasSupabase = snapshot["gaia.todo.supabase.synced"] === "true";
      const localRaw = snapshot["gaia.todo.v2.0.6"];
      const hasTasks =
        typeof localRaw === "string" && !localRaw.includes('"tasks":[]');
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
    const map: Record<Category, Task[]> = { life: [], work: [], distraction: [] };
    for (const t of tasks) map[t.category].push(t);
    return map;
  }, [tasks]);

  const orderedByCat = useMemo(() => {
    const map: Record<Category, Task[]> = { life: [], work: [], distraction: [] };
    (Object.keys(byCat) as Category[]).forEach((cat) => {
      map[cat] = byCat[cat]
        .slice()
        .sort((a, b) => compareDueDate(a.due_date, b.due_date) || a.created_at.localeCompare(b.created_at));
    });
    return map;
  }, [byCat]);

  const resolveStatus = useCallback((task: Task): StatusResolution => {
    const entries = Object.entries(task.status_by_date ?? {});
    let tone: StatusTone = "pending";
    if (entries.length > 0) {
      entries.sort((a, b) => b[0].localeCompare(a[0]));
      const [, status] = entries[0];
      tone = status === "done" ? "done" : status === "skipped" ? "skipped" : "pending";
    }
    return {
      label: tone === "done" ? "Done" : tone === "skipped" ? "Skipped" : "Pending",
      tone,
      // Show a single timing: the task's due date or Unscheduled.
      dateLabel: task.due_date ?? "Unscheduled",
    };
  }, []);

  const toneStyles: Record<StatusTone, string> = {
    pending:
      "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-400/20 dark:text-amber-200 dark:border-amber-400/30",
    done: "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-400/20 dark:text-emerald-100 dark:border-emerald-400/30",
    skipped:
      "bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-600/30 dark:text-slate-200 dark:border-slate-500",
  };

  const handleAdd = useCallback(
    async (category: Category) => {
      const title = drafts[category]?.trim();
      if (!title) return;
      try {
        await addQuickTask(category, title);
      } finally {
        setDrafts((prev) => ({ ...prev, [category]: "" }));
      }
    },
    [addQuickTask, drafts]
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
      const targetDate = task.due_date && task.due_date !== "Unscheduled" ? task.due_date : today;
      setTaskStatus(task.id, targetDate, next);
    },
    [setTaskStatus, today]
  );

  const resequenceCategory = useCallback(
    async (category: Category, orderedTasks: Task[]) => {
      if (orderedTasks.length === 0) return;
      const firstDate = orderedTasks.find((t) => t.due_date)?.due_date || shiftDate(today, 1);
      const updates: Promise<unknown>[] = [];
      orderedTasks.forEach((task, idx) => {
        const nextDate = shiftDate(firstDate, idx);
        if (task.due_date !== nextDate) {
          updates.push(editTask(task.id, { due_date: nextDate }));
        }
      });
      await Promise.all(updates);
    },
    [editTask, today]
  );

  const handleDrop = useCallback(
    async (category: Category, targetId: string | null, position: "before" | "after") => {
      if (!dragging || dragging.category !== category) {
        setDragging(null);
        setDropTarget(null);
        return;
      }
      const list = orderedByCat[category];
      const currentIdx = list.findIndex((t) => t.id === dragging.id);
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
      await resequenceCategory(category, next);
      setDragging(null);
      setDropTarget(null);
    },
    [dragging, orderedByCat, resequenceCategory]
  );

  const dragIndicator = (taskId: string, category: Category) => {
    if (!dragging || dragging.category !== category) return "";
    if (dragging.id === taskId) return "ring-2 ring-primary/70";
    if (dropTarget?.id === taskId && dropTarget.category === category) {
      return dropTarget.position === "before"
        ? "border-t-2 border-primary/70"
        : "border-b-2 border-primary/70";
    }
    return "";
  };

  return (
    <main className="mx-auto max-w-5xl p-4">
      <header className="mb-8 space-y-3 rounded-2xl border border-base-300 bg-gradient-to-r from-base-100 via-base-50 to-base-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">TODO {"\u2014"} All Tasks</h1>
          <span className="inline-flex items-center gap-2 rounded-full border border-base-300/70 px-3 py-1 text-xs text-base-content/70">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: storageStatus.synced ? "var(--gaia-positive)" : "var(--gaia-warning)" }} />
            {storageStatus.synced ? "Backed up to Supabase" : "Local only"}
          </span>
          <span className="text-xs text-base-content/60">
            Local cache {storageStatus.hasTasks ? "present" : "empty"}
          </span>
        </div>
        <p className="max-w-3xl text-sm text-base-content/70">
          Drag to reorder tasks inside each category. The order controls the scheduled date for that category, keeping one task per day. Drop at a new position to push its due date forward/backward automatically.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {CATEGORY_ORDER.map((cat) => (
          <section
            key={cat}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100/60 shadow-sm"
          >
            <div className="space-y-1 border-b border-base-300 bg-base-50/80 px-4 py-3">
              <h2 className="text-lg font-semibold tracking-tight">{LABELS[cat]}</h2>
              <p className="text-xs text-base-content/60">{HINTS[cat]}</p>
            </div>

            <div className="flex flex-1 flex-col">
              {orderedByCat[cat].length === 0 ? (
                <div className="space-y-1 p-5 text-sm text-base-content/60">
                  <p>No tasks in this category yet.</p>
                  <p>
                    Add one below or from the dashboard&apos;s &quot;Today&apos;s Focus&quot; cards using Quick Add, and they&apos;ll sync here automatically.
                  </p>
                </div>
              ) : (
                <ul
                  className="divide-y divide-base-300"
                  onDragOver={(e) => {
                    e.preventDefault();
                    const lastId = orderedByCat[cat][orderedByCat[cat].length - 1]?.id ?? null;
                    if (dragging && dragging.category === cat) {
                      setDropTarget({ id: lastId, category: cat, position: "after" });
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    void handleDrop(cat, dropTarget?.id ?? null, dropTarget?.position ?? "after");
                  }}
                >
                  {orderedByCat[cat].map((t) => {
                    const statusMeta = resolveStatus(t);

                    return (
                      <li
                        key={t.id}
                        className={`p-3 transition ${dragIndicator(t.id, cat)}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer?.setData("text/plain", t.id);
                          e.dataTransfer?.setDragImage(e.currentTarget, 10, 10);
                          e.dataTransfer.effectAllowed = "move";
                          setDragging({ id: t.id, category: cat });
                        }}
                        onDragEnter={(e) => {
                          const { top, height } = e.currentTarget.getBoundingClientRect();
                          const before = e.clientY < top + height / 2;
                          setDropTarget({ id: t.id, category: cat, position: before ? "before" : "after" });
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          const { top, height } = e.currentTarget.getBoundingClientRect();
                          const before = e.clientY < top + height / 2;
                          setDropTarget({ id: t.id, category: cat, position: before ? "before" : "after" });
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const pos = dropTarget?.position ?? "after";
                          void handleDrop(cat, t.id, pos);
                        }}
                        onDragEnd={() => {
                          setDragging(null);
                          setDropTarget(null);
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-base-200 text-[10px] uppercase text-base-content/70 shadow-inner cursor-grab active:cursor-grabbing">
                                :::
                              </span>
                              <div className="font-medium">{t.title}</div>
                            </div>
                            {t.note && (
                              <p className="text-sm text-base-content/70">{t.note}</p>
                            )}
                            {t.repeat && t.repeat !== "none" && (
                              <p className="mt-1 text-[11px] uppercase tracking-wide text-base-content/60">
                                Repeats: {String(t.repeat)}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-base-content/70">
                              <label className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${toneStyles[statusMeta.tone]}`}>
                                <span>Status</span>
                                <select
                                  className="rounded border border-base-200 bg-base-100 px-2 py-1 text-base-content font-semibold"
                                  value={statusMeta.tone}
                                  onChange={(e) => handleStatusChange(t, e.target.value as StatusTone)}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="done">Done</option>
                                  <option value="skipped">Skipped</option>
                                </select>
                              </label>
                              <label className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-50 px-3 py-2 text-xs font-semibold">
                                <span>Due</span>
                                <input
                                  type="date"
                                  className="rounded border border-base-200 bg-base-100 px-2 py-1 text-base-content font-semibold"
                                  value={t.due_date ?? ""}
                                  min="2025-01-01"
                                  max="2030-12-31"
                                  onChange={(e) => handleDateChange(t.id, e.target.value)}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-lg border border-base-300 px-2 py-1 text-xs text-base-content/70 hover:bg-base-200"
                              onClick={() => deleteTask(t.id)}
                              title="Delete task"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <form
                className="flex flex-wrap items-center gap-2 border-t border-base-300 bg-base-50/70 p-3 text-sm"
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
                  className="flex-1 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content placeholder:text-base-content/40"
                  placeholder={`Add a ${LABELS[cat]} task...`}
                  value={drafts[cat]}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [cat]: e.target.value }))
                  }
                />
                <button
                  type="submit"
                  className="rounded-lg bg-base-content px-4 py-2 text-sm font-semibold text-base-100 transition hover:opacity-90 disabled:opacity-40"
                  disabled={!drafts[cat].trim()}
                >
                  Add
                </button>
              </form>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

type StatusRowProps = {
  task: Task;
  toneStyles: Record<StatusTone, string>;
  status: StatusResolution;
};

function StatusRow({ task, toneStyles, status }: StatusRowProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2 text-xs">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${toneStyles[status.tone]}`}
      >
        Status: {status.label}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-base-300/60 px-2 py-0.5 text-base-content/70">
        Due: {formatShortDate(task.due_date ?? status.dateLabel)}
      </span>
    </div>
  );
}
