import type { FC } from "react";
import type { HealthDaySnapshot } from "../lib/types";

interface HistoryListProps {
  days: HealthDaySnapshot[];
  todayKey: string;
}

function formatDayLabel(day: string) {
  const d = new Date(`${day}T00:00:00`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function computeInactiveStreak(days: HealthDaySnapshot[], todayKey: string) {
  const index = days.findIndex((d) => d.day === todayKey);
  if (index === -1) return 0;

  let streak = 0;
  for (let i = index; i < days.length; i++) {
    const d = days[i];
    if (d.walkMinutes === 0) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

const HistoryList: FC<HistoryListProps> = ({ days, todayKey }) => {
  const inactiveStreak = computeInactiveStreak(days, todayKey);

  return (
    <section className="health-surface p-5 md:p-7">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--gaia-text-strong)] md:text-xl">
            Recent days
          </h2>
          <p className="text-sm md:text-base gaia-muted">
            Vertical timeline with a quick health snapshot for each day.
          </p>
        </div>
        {inactiveStreak > 1 ? (
          <p className="rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--gaia-warning)] md:text-sm">
            Inactive streak: {inactiveStreak} days without walking
          </p>
        ) : null}
      </header>
      <ol className="relative mt-3 space-y-3 pl-1">
        <div className="absolute bottom-0 left-[9px] top-0 w-px bg-[var(--gaia-border)]" />
        {days.map((day) => {
          const isToday = day.day === todayKey;
          const sleep = `${Math.floor(day.sleepMinutes / 60)}h ${
            day.sleepMinutes % 60
          }m`;
          const water = `${(day.waterMl / 1000).toFixed(1)}L`;
          const walkText =
            day.walkMinutes === 0 ? "No walking" : `${day.walkMinutes} min`;
          const training =
            day.trainingCompletionPercent == null
              ? "--"
              : `${Math.round(day.trainingCompletionPercent)}%`;
          const mood =
            day.moodRating == null ? "--/5" : `${day.moodRating}/5`;

          return (
            <li key={day.day} className="relative flex items-start gap-3 pl-4">
              <div className="flex flex-col items-center pt-1">
                <div
                  className={`h-3 w-3 rounded-full border ${
                    isToday
                      ? "border-[var(--gaia-contrast-bg)] bg-[var(--gaia-contrast-bg)]/80"
                      : day.walkMinutes === 0
                      ? "border-[var(--gaia-warning)] bg-[var(--gaia-warning)]/80"
                      : "border-[var(--gaia-border)] bg-[var(--gaia-border)]"
                  }`}
                />
              </div>
              <div className="flex-1 rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span
                    className={`font-semibold ${
                      isToday
                        ? "text-[var(--gaia-text-strong)]"
                        : "text-[var(--gaia-text-default)]"
                    }`}
                  >
                    {isToday ? "Today" : formatDayLabel(day.day)}
                  </span>
                  <span className="text-sm gaia-muted">
                    Sleep {sleep} | Water {water} | Walk {walkText} | Train {training} | Mood {mood}
                  </span>
                </div>
                {day.moodNote ? (
                  <p className="mt-1 text-sm gaia-muted line-clamp-1">
                    {day.moodNote}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default HistoryList;
