"use client";

import React from "react";
import type { AutoBoxResult } from "../featureLogic";
import { MediaCard } from "./MediaCard";
import { formatMediaTitle } from "../formatMediaTitle";

interface FeatureHeroProps {
  autoBox: AutoBoxResult;
}

export const FeatureHero: React.FC<FeatureHeroProps> = ({ autoBox }) => {
  if (!autoBox.item) {
    return (
      <section className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-4 text-sm text-base-content/70">
        <p className="font-medium">No Feature Yet</p>
        <p className="mt-1 text-xs">
          Add some memories to your Gallery and GAIA will start picking a
          Feature of the Day here.
        </p>
      </section>
    );
  }

  const displayTitle = formatMediaTitle(autoBox.item.title);

  return (
    <section className="rounded-3xl bg-base-100/80 p-5 shadow-lg shadow-base-200">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex-1 space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {autoBox.label}
          </p>
          <h2 className="text-xl font-semibold text-base-content">
            Feature of the Day -{" "}
            <span className="text-primary">{displayTitle}</span>
          </h2>
          <p className="text-xs text-base-content/70 max-w-xl">
            {autoBox.description}
          </p>
          {autoBox.item.description && (
            <p className="text-xs text-primary/90 max-w-xl">
              "{autoBox.item.description}"
            </p>
          )}
        </div>
        <div className="flex-1 md:max-w-sm">
          {/* Reuse the same card visuals so the hero stays consistent with the grid. */}
          <MediaCard item={autoBox.item} onClick={() => {}} isCurrent={false} />
        </div>
      </div>
    </section>
  );
};
