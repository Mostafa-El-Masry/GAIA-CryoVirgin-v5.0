import type { FC } from "react";
import type {
  HealthDaySnapshot,
  WaterContainer,
} from "../lib/types";
import SleepCard from "./SleepCard";
import WaterCard from "./WaterCard";
import WalkingCard from "./WalkingCard";
import TrainingCard from "./TrainingCard";
import MoodCard from "./MoodCard";

function formatDayLabel(day: string) {
  const d = new Date(`${day}T00:00:00`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface TodayViewProps {
  today: HealthDaySnapshot;
  isSleeping: boolean;
  onSleepStart: () => void;
  onWake: () => void;
  waterContainers: WaterContainer[];
  onAddWaterByContainer: (containerId: string, quantity: number) => void;
  onAddWaterMl: (ml: number) => void;
  onAddCustomWaterContainer: (name: string, sizeMl: number) => void;
  isWalking: boolean;
  onWalkStart: () => void;
  onWalkStop: () => void;
  todayTrainingPlanned: number;
  todayTrainingActual: number;
  onSaveTraining: (planned: number, actual: number) => void;
  onSaveMood: (rating: number, note: string) => void;
}

const TodayView: FC<TodayViewProps> = ({
  today,
  isSleeping,
  onSleepStart,
  onWake,
  waterContainers,
  onAddWaterByContainer,
  onAddWaterMl,
  onAddCustomWaterContainer,
  isWalking,
  onWalkStart,
  onWalkStop,
  todayTrainingPlanned,
  todayTrainingActual,
  onSaveTraining,
  onSaveMood,
}) => {
  return (
    <section className="health-surface space-y-5 p-5 md:p-7">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
            Today
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--gaia-text-strong)]">
              Health Pulse
            </h1>
            <span className="rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--gaia-text-strong)]">
              Live snapshot
            </span>
          </div>
          <p className="max-w-2xl text-sm md:text-base gaia-muted">
            Lightweight controls for sleep, water, walking, training, and mood. Everything stays synced and remains offline-first.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm gaia-muted">
          <span className="min-w-[96px] rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 text-center text-sm font-semibold text-[var(--gaia-text-default)]">
            {formatDayLabel(today.day)}
          </span>
        </div>
      </header>

      <div className="grid gap-4 md:gap-5">
        <SleepCard
          minutes={today.sleepMinutes}
          isSleeping={isSleeping}
          onSleepStart={onSleepStart}
          onWake={onWake}
        />
        <WaterCard
          ml={today.waterMl}
          containers={waterContainers}
          onAddByContainer={onAddWaterByContainer}
          onAddMl={onAddWaterMl}
          onAddCustomContainer={onAddCustomWaterContainer}
        />
        <WalkingCard
          minutes={today.walkMinutes}
          isWalking={isWalking}
          onStart={onWalkStart}
          onStop={onWalkStop}
        />
        <TrainingCard
          completion={today.trainingCompletionPercent}
          todayPlanned={todayTrainingPlanned}
          todayActual={todayTrainingActual}
          onSave={onSaveTraining}
        />
        <MoodCard
          rating={today.moodRating}
          note={today.moodNote}
          onSave={onSaveMood}
        />
      </div>
    </section>
  );
};

export default TodayView;
