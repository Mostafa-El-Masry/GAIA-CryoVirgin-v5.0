import type { FC, FormEvent } from "react";
import { useState, useEffect } from "react";
import DaySnapshotCard from "./DaySnapshotCard";

interface TrainingCardProps {
  completion: number | null;
  todayPlanned: number;
  todayActual: number;
  onSave: (planned: number, actual: number) => void;
}

const TrainingCard: FC<TrainingCardProps> = ({
  completion,
  todayPlanned,
  todayActual,
  onSave,
}) => {
  const [planned, setPlanned] = useState<string>(
    todayPlanned ? String(todayPlanned) : ""
  );
  const [actual, setActual] = useState<string>(
    todayActual ? String(todayActual) : ""
  );

  useEffect(() => {
    setPlanned(todayPlanned ? String(todayPlanned) : "");
    setActual(todayActual ? String(todayActual) : "");
  }, [todayPlanned, todayActual]);

  const value =
    completion == null ? "--" : `${Math.round(completion).toString()}%`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const p = Number.parseFloat(planned || "0");
    const a = Number.parseFloat(actual || "0");
    if (!Number.isFinite(p) || p < 0) return;
    if (!Number.isFinite(a) || a < 0) return;
    onSave(p, a);
  };

  return (
    <DaySnapshotCard
      title="Training"
      value={value}
      subtitle="Planned vs actual volume for today."
      footer={
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs gaia-muted">Plan</label>
            <input
              type="number"
              min={0}
              value={planned}
              onChange={(e) => setPlanned(e.target.value)}
              className="gaia-input gaia-focus w-24 rounded-lg px-2 py-1 text-xs"
            />
            <span className="text-xs gaia-muted">units</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs gaia-muted">Actual</label>
            <input
              type="number"
              min={0}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className="gaia-input gaia-focus w-24 rounded-lg px-2 py-1 text-xs"
            />
            <span className="text-xs gaia-muted">units</span>
          </div>
          <button
            type="submit"
            className="health-button w-full md:w-auto px-5 py-2 text-xs font-semibold md:text-sm"
          >
            Save training
          </button>
        </form>
      }
    />
  );
};

export default TrainingCard;
