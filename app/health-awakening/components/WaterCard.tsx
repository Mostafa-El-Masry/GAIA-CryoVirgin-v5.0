import type { FC, FormEvent } from "react";
import { useState } from "react";
import DaySnapshotCard from "./DaySnapshotCard";
import type { WaterContainer } from "../lib/types";

interface WaterCardProps {
  ml: number;
  containers: WaterContainer[];
  onAddByContainer: (containerId: string, quantity: number) => void;
  onAddMl: (ml: number) => void;
  onAddCustomContainer: (name: string, sizeMl: number) => void;
}

const WaterCard: FC<WaterCardProps> = ({
  ml,
  containers,
  onAddByContainer,
  onAddMl,
  onAddCustomContainer,
}) => {
  const liters = ml / 1000;
  const value = `${liters.toFixed(1)} L`;

  const [freeMl, setFreeMl] = useState("");
  const [customName, setCustomName] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const defaultContainers = containers.filter(
    (c) => c.isDefault && c.isActive
  );
  const customContainers = containers.filter(
    (c) => !c.isDefault && c.isActive
  );

  const handleAddFree = () => {
    const parsed = Number.parseInt(freeMl, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onAddMl(parsed);
    setFreeMl("");
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    const name = customName.trim();
    const size = Number.parseInt(customSize, 10);
    if (!name || !Number.isFinite(size) || size <= 0) return;
    onAddCustomContainer(name, size);
    setCustomName("");
    setCustomSize("");
    setShowCustom(true);
  };

  return (
    <DaySnapshotCard
      title="Water"
      value={value}
      subtitle="Track water via cups, bottles, and custom containers."
      footer={
        <div className="space-y-3">
          <div className="flex flex-wrap justify-center gap-1.5">
            {defaultContainers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onAddByContainer(c.id, 1)}
                className="inline-flex items-center rounded-full border border-[var(--gaia-contrast-bg)]/40 bg-[var(--gaia-contrast-bg)]/10 px-3 py-1 text-xs font-semibold text-[var(--gaia-text-strong)] hover:bg-[var(--gaia-contrast-bg)]/15"
              >
                {c.name} | {c.sizeMl} ml
              </button>
            ))}
            {customContainers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onAddByContainer(c.id, 1)}
                className="inline-flex items-center rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface)]"
              >
                {c.name} | {c.sizeMl} ml
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <input
              type="number"
              min={0}
              value={freeMl}
              onChange={(e) => setFreeMl(e.target.value)}
              placeholder="e.g. 250"
              className="gaia-input gaia-focus w-28 rounded-lg px-2 py-1 text-sm"
            />
            <span className="text-xs gaia-muted">ml</span>
            <button
              type="button"
              onClick={handleAddFree}
              className="health-button w-full md:w-auto px-4 py-2 text-xs font-semibold md:text-sm"
            >
              Add ml
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowCustom((v) => !v)}
            className="text-xs font-semibold text-[var(--gaia-contrast-bg)] hover:underline"
          >
            {showCustom ? "Hide custom containers" : "Add custom container"}
          </button>
          {showCustom && (
            <form
              onSubmit={handleCustomSubmit}
              className="flex flex-wrap items-center gap-2 rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] p-2"
            >
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Name"
                className="gaia-input gaia-focus min-w-[120px] flex-1 rounded-lg px-2 py-1 text-sm"
              />
              <input
                type="number"
                min={0}
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                placeholder="1500"
                className="gaia-input gaia-focus w-24 rounded-lg px-2 py-1 text-sm"
              />
              <span className="text-xs gaia-muted">ml</span>
              <button
                type="submit"
                className="health-button w-full px-3 py-1 text-xs font-semibold sm:w-auto"
              >
                Save
              </button>
            </form>
          )}
        </div>
      }
    />
  );
};

export default WaterCard;
