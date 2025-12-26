import type { FC } from "react";
import DaySnapshotCard from "./DaySnapshotCard";

interface WalkingCardProps {
  minutes: number;
  isWalking: boolean;
  onStart: () => void;
  onStop: () => void;
}

const WalkingCard: FC<WalkingCardProps> = ({
  minutes,
  isWalking,
  onStart,
  onStop,
}) => {
  const value = minutes === 0 ? "No walking" : `${minutes} min`;

  const handleClick = () => {
    if (isWalking) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <DaySnapshotCard
      title="Walking"
      value={value}
      subtitle="Use Start / Stop walking to track activity."
      footer={
        <button
          type="button"
          onClick={handleClick}
          className="health-button w-full md:w-auto px-5 py-2 text-xs font-semibold md:text-sm"
        >
          {isWalking ? "Stop walking" : "Start walking"}
        </button>
      }
    />
  );
};

export default WalkingCard;
