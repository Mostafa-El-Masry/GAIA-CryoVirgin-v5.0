import type { FC } from "react";
import DaySnapshotCard from "./DaySnapshotCard";

interface SleepCardProps {
  minutes: number;
  isSleeping: boolean;
  onSleepStart: () => void;
  onWake: () => void;
}

const SleepCard: FC<SleepCardProps> = ({
  minutes,
  isSleeping,
  onSleepStart,
  onWake,
}) => {
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  const value = `${hours}h ${remMinutes}m`;

  const handleClick = () => {
    if (isSleeping) {
      onWake();
    } else {
      onSleepStart();
    }
  };

  return (
    <DaySnapshotCard
      title="Sleep"
      value={value}
      subtitle="Use Sleep / Wake to track rest."
      footer={
        <button
          type="button"
          onClick={handleClick}
          className="health-button w-full md:w-auto px-5 py-2 text-xs font-semibold md:text-sm"
        >
          {isSleeping ? "Wake" : "Sleep"}
        </button>
      }
    />
  );
};

export default SleepCard;
