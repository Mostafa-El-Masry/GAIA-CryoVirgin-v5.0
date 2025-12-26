import type { FC, ReactNode } from "react";

interface DaySnapshotCardProps {
  title: string;
  value: string;
  subtitle?: string;
  footer?: ReactNode;
}

const DaySnapshotCard: FC<DaySnapshotCardProps> = ({
  title,
  value,
  subtitle,
  footer,
}) => {
  return (
    <article className="health-surface relative flex min-h-[148px] flex-col justify-between overflow-hidden px-4 py-3 md:px-5 md:py-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-6 top-4 h-16 w-16 rounded-full bg-[var(--gaia-contrast-bg)]/10 blur-3xl" />
        <div className="absolute left-6 bottom-0 h-14 w-14 rounded-full bg-[var(--gaia-info)]/10 blur-3xl" />
      </div>
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 text-[var(--gaia-text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--gaia-contrast-bg)]" />
          <h2 className="text-xs md:text-sm font-medium">{title}</h2>
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums text-[var(--gaia-text-strong)] md:text-3xl">
          {value}
        </div>
        {subtitle ? (
          <p className="mt-1 text-sm md:text-base gaia-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
      {footer ? (
        <div className="relative mt-3 flex justify-center border-t gaia-border pt-3 text-sm text-[var(--gaia-text-default)] md:text-base">
          {footer}
        </div>
      ) : null}
    </article>
  );
};

export default DaySnapshotCard;
