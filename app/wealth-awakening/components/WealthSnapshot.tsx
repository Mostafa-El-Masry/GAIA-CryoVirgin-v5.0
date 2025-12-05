import type { FC } from "react";
import type { WealthOverview } from "../lib/types";

interface WealthSnapshotProps {
  overview: WealthOverview;
}

const surface =
  "rounded-2xl border gaia-border bg-[var(--gaia-surface)] shadow-[0_18px_60px_rgba(0,0,0,0.18)]";

const formatCurrency = (value: number, currency: string) => {
  if (!Number.isFinite(value)) return "-";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
};

const formatPercent = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(1)}%`;
};

const WealthSnapshot: FC<WealthSnapshotProps> = ({ overview }) => {
  const c = overview.primaryCurrency;

  return (
    <article
      className={`${surface} relative overflow-hidden p-5 text-[var(--gaia-text-default)] md:p-6`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-10 top-4 h-24 w-24 rounded-full bg-[var(--gaia-contrast-bg)]/10 blur-3xl" />
        <div className="absolute left-6 bottom-2 h-20 w-20 rounded-full bg-[var(--gaia-info)]/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-24 w-24 -translate-x-1/2 rounded-full bg-[var(--gaia-contrast-bg)]/8 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gaia-text-default)]">
          Today / This Month
        </div>
        <div className="text-[11px] gaia-muted">
          Cash + certificates + investments, plus this month&apos;s inflow/outflow
          story.
        </div>
      </div>

      <div className="relative mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] p-4 shadow-inner shadow-black/10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
              Net Stash
            </h2>
            <p className="mt-1 text-2xl font-semibold text-[var(--gaia-text-strong)] md:text-3xl">
              {formatCurrency(overview.totalNetWorth, c)}
            </p>
            <p className="mt-1 text-xs gaia-muted">
              Cash, certificates, and investments combined.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--gaia-text-default)]">
              <span>
                This month change:{" "}
                <span className="font-semibold text-[var(--gaia-contrast-bg)]">
                  {formatCurrency(overview.monthStory.netChange, c)}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border gaia-border bg-[var(--gaia-surface)] px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gaia-contrast-bg)]" />
                {formatPercent(overview.monthStory.netChangePercent)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] p-4 shadow-inner shadow-black/10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
                Money Map
              </h2>
              <span className="text-[11px] gaia-muted">
                {overview.accounts.length} accounts - {overview.instruments.length} instruments
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-[var(--gaia-text-default)] sm:grid-cols-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide gaia-muted">
                  Cash
                </div>
                <div className="font-semibold text-[var(--gaia-text-strong)]">
                  {formatCurrency(overview.totalCash, c)}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide gaia-muted">
                  Certificates
                </div>
                <div className="font-semibold text-[var(--gaia-text-strong)]">
                  {formatCurrency(overview.totalCertificates, c)}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide gaia-muted">
                  Investments
                </div>
                <div className="font-semibold text-[var(--gaia-text-strong)]">
                  {formatCurrency(overview.totalInvestments, c)}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] gaia-muted">
              This is the map. Driving logic evolves as you add flows, levels, and
              projections.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] p-4 text-[var(--gaia-text-default)] shadow-inner shadow-black/10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
            Monthly Story
          </h2>
          <p className="mt-2 text-sm text-[var(--gaia-text-default)]">{overview.monthStory.story}</p>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-[var(--gaia-text-default)]">
            <div>
              <div className="text-[10px] uppercase tracking-wide gaia-muted">
                Deposits + income
              </div>
              <div className="font-semibold text-[var(--gaia-text-strong)]">
                {formatCurrency(
                  overview.monthStory.totalDeposits +
                    overview.monthStory.totalIncome +
                    overview.monthStory.totalInterest,
                  c,
                )}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide gaia-muted">
                Withdrawals + expenses
              </div>
              <div className="font-semibold text-[var(--gaia-text-strong)]">
                {formatCurrency(
                  overview.monthStory.totalWithdrawals + overview.monthStory.totalExpenses,
                  c,
                )}
              </div>
            </div>
          </div>
          <footer className="mt-4 text-[11px] gaia-muted">
            Later, Wall Street Drive will send this summary into the Daily Thread as your Money
            Pulse.
          </footer>
        </div>
      </div>
    </article>
  );
};

export default WealthSnapshot;
