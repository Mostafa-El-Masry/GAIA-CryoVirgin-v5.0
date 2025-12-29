"use client";

export type LessonNavItem = {
  id: string;
  code: string;
  title: string;
  isCompleted?: boolean;
};

export type LessonSidebarProps = {
  courseTitle: string;
  pathTitle: string;
  completionLabel?: string;
  lessons: LessonNavItem[];
  activeLessonId: string;
};
export function LessonSidebar({
  courseTitle,
  pathTitle,
  completionLabel = "0% complete",
  lessons,
  activeLessonId,
}: LessonSidebarProps) {
  return (
    <aside className="hidden lg:flex rounded-2xl gaia-panel-soft border gaia-border flex flex-col h-full overflow-hidden">
      <div className="border-b gaia-border px-4 py-3 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] gaia-muted">
          {pathTitle}
        </p>
        <p className="text-sm font-semibold gaia-strong">{courseTitle}</p>
        <p className="text-[11px] gaia-muted mt-1">{completionLabel}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {lessons.map((lesson) => {
          const isActive = lesson.id === activeLessonId;
          const isCompleted = lesson.isCompleted;
          return (
            <button
              key={lesson.id}
              type="button"
              className={[
                "w-full rounded-xl border px-3 py-2 text-left text-xs sm:text-sm flex items-center gap-3",
                "transition shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-sm",
                isActive
                  ? "border-info bg-info/10"
                  : "gaia-border gaia-ink-soft",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={[
                    "h-6 w-6 flex items-center justify-center rounded-full border text-[11px] font-semibold",
                    isCompleted
                      ? "bg-info text-contrast-text border-info"
                      : "gaia-border gaia-muted",
                  ].join(" ")}
                >
                  {lesson.code}
                </div>
                <span
                  className={[
                    "truncate",
                    isCompleted ? "gaia-muted line-through" : "gaia-strong",
                  ].join(" ")}
                >
                  {lesson.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
