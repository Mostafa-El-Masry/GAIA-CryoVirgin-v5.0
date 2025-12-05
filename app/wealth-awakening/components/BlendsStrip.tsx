"use client";

import type { FC } from "react";
import type { WealthLevelsSnapshot } from "../lib/types";
import { BLENDS, pickBlendForSnapshot } from "../lib/blends";

interface BlendsStripProps {
  snapshot: WealthLevelsSnapshot | null;
}

const surface =
  "rounded-2xl border gaia-border bg-[var(--gaia-surface)] text-[var(--gaia-text-default)] shadow-[0_18px_60px_rgba(0,0,0,0.18)]";

const BlendsStrip: FC<BlendsStripProps> = ({ snapshot }) => {
  const activeBlend = pickBlendForSnapshot(snapshot);

  return (
    <section className={`${surface} mt-4 p-4 md:p-5`}>
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
            Blends - Wealth lanes
          </h2>
          <p className="mt-1 text-xs gaia-muted">
            Four simple lanes GAIA can use to describe your current money season. Right now you are
            closest to:
          </p>
        </div>
      </header>

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <article className="rounded-xl border border-[var(--gaia-contrast-bg)]/40 bg-[var(--gaia-contrast-bg)]/12 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--gaia-text-strong)]">
            Current blend
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--gaia-text-strong)]">
            {activeBlend.shortLabel}
          </h3>
          <p className="mt-1 text-xs text-[var(--gaia-text-default)]">{activeBlend.objective}</p>
          <p className="mt-2 text-[11px] gaia-muted">{activeBlend.importance}</p>
        </article>

        <article className="rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
            All blends
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[var(--gaia-text-default)]">
            {BLENDS.map((blend) => {
              const isActive = blend.id === activeBlend.id;
              return (
                <li key={blend.id}>
                  <div
                    className={`inline-flex w-full items-center justify-between rounded-full border px-3 py-1 ${
                      isActive
                        ? "border-[var(--gaia-contrast-bg)]/70 bg-[var(--gaia-contrast-bg)]/12 text-[var(--gaia-text-strong)] font-semibold"
                        : "gaia-border bg-[var(--gaia-surface)] text-[var(--gaia-text-default)]"
                    }`}
                  >
                    <span>{blend.shortLabel}</span>
                    {isActive && (
                      <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--gaia-contrast-bg)]" />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[10px] gaia-muted">
            Later versions can attach concrete targets and simulations to each blend. For now they
            act as a language for where you are driving.
          </p>
        </article>
      </div>
    </section>
  );
};

export default BlendsStrip;
